import { Discord, Script } from "@lib/index"
import { Message, MessageButton, MessageActionRow } from "discord.js"
import { CommandManager } from "@lib/CommandManager"
import { generateHashCard, generateRandomCard, drawCardFromData } from "./utils/RankedCardGenerator"
import logger from "@utils/logger"
import { RankedCard } from "./model/RankedCard"
import { UserCard } from "./model/UserCard"
import SequelizeDBManager from "@lib/SequelizeDBManager"
import initModels from "./db/initModels"
import { AnyARecord } from "dns"

export class RankedCardsScript extends Script {

    protected scriptName = "Ranked Cards Script"

    protected onUserMessage: undefined
    public initDbModels = initModels

    private async startLoading(message: Message, palabra: string) {
        const loadingMessage = await message.channel.send(palabra);
        const loadingPoints = ['.', '..', '...'];
        let index = 0;
        const updateLoadingMessage = () => {
            loadingMessage.edit(palabra+loadingPoints[index]);
            index = (index + 1) % loadingPoints.length;
        };
        return {intervalId: setInterval(updateLoadingMessage, 1000), loadingMessage};
    }

    private stopLoading(loading: { intervalId: any; loadingMessage: any }) {
        clearInterval(loading.intervalId);
        loading.loadingMessage.delete();
    }

    public async onInitialized() {

        Discord.getInstance().on('interactionCreate', async interaction => {
          if (!interaction.isButton()) return; // Verificar si la interacción es un botón
          
          if (interaction.customId.startsWith("sellcard")) {
              const cardId = parseInt(interaction.customId.split("_")[1]);
              await sellCard(interaction.user.id, cardId);
              await interaction.reply('Proximamente...');
          }
        });

        CommandManager.newCommand("topcarta", null, async (message: Message, args) => {
            const loading = await this.startLoading(message, "Cargando");
            try {
                const userCarta = await findOrCreateUser(message.author.id);
                const carta = await findTopCard(userCarta[0].id);
                if(carta) {
                    let cartaGenerada = await drawCardFromData(carta);
                    sendCard(message, cartaGenerada[0]);
                }
                else {
                    message.reply("Ché no tenés cartas");
                }

                this.stopLoading(loading);
            } catch (error) {
                logger.error(error);
                this.stopLoading(loading);
                message.reply("Hubo un error al intentar obtener la carta.")
            }
            

        }, "Muestra tu carta Top", "Ranked Cards")

        CommandManager.newCommand("topcartaglobal", null, async (message: Message, args) => {
            const loading = await this.startLoading(message, "Cargando");
            try {
                
                const carta = await findAllTopCard();
                if(carta) {
                    let cartaGenerada = await drawCardFromData(carta);
                    sendCard(message, cartaGenerada[0]);
                }
                else {
                    message.reply("No hay cartas");
                }

                this.stopLoading(loading);
            } catch (error) {
                logger.error(error);
                this.stopLoading(loading);
                message.reply("Hubo un error al intentar obtener la carta.")
            }
            

        }, "Muestra la carta top global", "Ranked Cards")

        CommandManager.newCommand("cartas", "", async (message: Message, args) => {

            let isHash = false;

            if(args.length >=2 && args[0] != null) {
                isHash = true;
            }

            const userCarta = await findOrCreateUser(message.author.id);

            if(!isHash) {
                try {
    
                    const lastDraw = userCarta[0].lastDraw ? userCarta[0].lastDraw : new Date(0);
                    const now = new Date();
                    const timeSince = now.getTime() - lastDraw.getTime();
                    
                    const hoursSince = timeSince / (1000 * 60 * 60);
    
                    // Verificar si la diferencia es menor a 24 horas
                    if (hoursSince < 0) {
                        // Convertir a horas, minutos y segundos para mostrar
                        const horas = Math.floor(hoursSince);
                        const minutos = Math.floor((timeSince / (1000 * 60)) % 60);
                        const segundos = Math.floor((timeSince / 1000) % 60);
    
                        // Tiempo restante para completar 24 horas
                        const totalSegundosRestantes = (23 * 60 * 60) - (horas * 60 * 60 + minutos * 60 + segundos);
                        const horasRestantes = Math.floor(totalSegundosRestantes / 3600);
                        const minutosRestantes = Math.floor((totalSegundosRestantes % 3600) / 60);
                        const segundosRestantes = totalSegundosRestantes % 60;
    
                        // Formatear el resultado como un string

                        const tiempoRestante = (horasRestantes > 0 ? (horasRestantes + " hora" + (horasRestantes == 1 ? ", " : "s, ")) : "") + 
                                                (minutosRestantes > 0 ? (minutosRestantes + " minuto" + (minutosRestantes == 1 ? " y " : "s y ")) : "") + 
                                                segundosRestantes + " segundo" + (segundosRestantes == 1 ? "" : "s");
                        
                        function delay(ms: number) {
                            return new Promise(resolve => setTimeout(resolve, ms));
                        }
                        await message.channel.send("Tenés que esperar " + tiempoRestante + " antes de poder sacar cartas de nuevo");
                        if(hoursSince < 1) {
                            await delay(1023);
                            await message.channel.send("Ni una hora ha pasado...");
                        }
                        return;
                    }
                    else {
                        updateLastDraw(message.author.id, now);
                    }
                }
                catch(error) {
                    logger.error(error);
                }
            }
    

            const loading = await this.startLoading(message, "Generando");

            try {

                let imageBuffers = [];
                let cardPrices = [];
                let cardIds = [];
                
                if(isHash) {
                    let generatedCard = await generateHashCard(args[0], args[1]);
                    imageBuffers.push(generatedCard[0]);
                    cardPrices.push(0);
                }
                else {
                    let generatedCard;
                    for(var i = 0; i < 4; i++) {
                        let shiny = 500*Math.random() < 1;
                        generatedCard = await generateRandomCard(message.author.username, shiny);
                        imageBuffers.push(generatedCard[0]);
                        cardPrices.push(calculateCardPrice(generatedCard[1].stars,generatedCard[1].curated,generatedCard[1].chroma,generatedCard[1].shiny))
                        const cardData = generatedCard[1];
                        cardData.userCardId = userCarta[0].id;                       
                        let cartId = await saveCard(cardData);
                        cardIds.push(cartId);
                    }
                }
    
                this.stopLoading(loading);
    
                // Enviar carta
                for(var i = 0; i < imageBuffers.length; i++) {
                    await sendCard(message, imageBuffers[i]);
                    await sendButton(message, cardIds[i], cardPrices[i]);
                }                

            } catch (error) {
                logger.error(error);
                this.stopLoading(loading);
                message.reply("Hubo un error al intentar generar la/s carta/s.")
            }


        }, "Genera 4 cartas ranked", "Ranked Cards")
    }
}

async function sendCard(message: Message, imageBuffer: any) {
    await message.reply({ 
        files: [{
                attachment: imageBuffer,
                name: "card.png" 
        }]});
}

async function sendButton(message: Message, cardId: number, cardPrice: number) {
    const row = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId("sellcard_" + cardId) // Este ID se usará para identificar el botón en el evento de interacción
            .setLabel('Vender esta carta por ' + cardPrice + ' Pesos') // Este es el texto que aparecerá en el botón
            .setStyle('SECONDARY'), // Esto define el color/estilo del botón, los estilos pueden ser PRIMARY, SECONDARY, SUCCESS, DANGER, o LINK
    );
    await message.channel.send({components: [row] });
}

async function saveCard(cardData: any) {
    try {
      const sequelize =  SequelizeDBManager.getInstance();
      await sequelize.sync();
      const card = await RankedCard.create(cardData);
      return card.id;
    } catch (error) {
      console.error('Error al guardar la carta:', error);
    }
}

async function findTopCard(userId: number) {
    try {
      const card = await RankedCard.findOne({
        where: { userCardId: userId },
        order: [['stars', 'DESC']],
      });
  
      return card;

    } catch (error) {
      console.error('Error al buscar la carta:', error);
    }
}

async function findAllTopCard() {
    try {
      const card = await RankedCard.findOne({
        order: [['stars', 'DESC']]
      });
  
      return card;

    } catch (error) {
      console.error('Error al buscar la carta:', error);
    }
}

async function findLastCard(userId: string) {
    try {
      const card = await RankedCard.findOne({
        where: { owner: userId },
        order: [['date', 'DESC']],
      });
  
      return card;

    } catch (error) {
      console.error('Error al buscar la carta:', error);
    }
}

async function deleteAllCards(userId: string) {
    try {
        const result = await RankedCard.destroy({
          where: { songAowneruthorName: userId },
        });
    
        if (result > 0) {
            console.log(`${result} carta(s) eliminada(s) con éxito.`);
            return true;
        } else {
            console.log('No se encontraron cartas para eliminar con el autor especificado.');
            return false;
        }
    } catch (error) {
        console.error('Error al eliminar las cartas:', error);
    }
}

async function findOrCreateUser(userId: string) {
    try {
      const user = await UserCard.findOrCreate({
        where: { discordUserId: userId }
      });
  
      return user;

    } catch (error) {
      console.error('Error al buscar o crear el usuario:', error);
    }
}

async function sellCard(discordUserId: string, cardId: number) {
  console.log(discordUserId, cardId);
}

function calculateCardPrice(stars: number, curated: boolean, chroma: boolean, shiny: boolean) {
  let value = 5000;
  const sp = stars/13; //TO-DO obtener el numero maximo de stars de la base de datos al iniciar la aplicacion;
  const starsWeight = sp*sp*sp*sp;
  value = value*starsWeight;
  if(curated) {
    value = value*1.5;
  }
  if(chroma) {
    value = value*1.2;
  }
  if(shiny) {
    value = value*20;
  }
  return Math.round(value);
}

function updateLastDraw(discordUserId: string, newLastDrawValue: Date) {
    return UserCard.update(
      { lastDraw: newLastDrawValue }, // nuevos valores para actualizar
      { where: { discordUserId: discordUserId } } // criterio para buscar el registro a actualizar
    )
    .then(result => {
      return result;
    })
    .catch(error => {
      console.error('Error al actualizar LastDraw:', error);
      throw error;
    });
  }

  function updateMoney(discordUserId: string, newMoneyValue: number) {
    return UserCard.update(
      { money: newMoneyValue }, // nuevos valores para actualizar
      { where: { discordUserId: discordUserId } } // criterio para buscar el registro a actualizar
    )
    .then(result => {
      return result;
    })
    .catch(error => {
      console.error('Error al actualizar Money:', error);
      throw error;
    });
  }