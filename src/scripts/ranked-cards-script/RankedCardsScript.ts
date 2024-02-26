import { Script } from "@lib/index"
import { Message, MessageButton, MessageActionRow } from "discord.js"
import { CommandManager } from "@lib/CommandManager"
import { generateHashCard, generateRandomCard, drawCardFromData } from "./utils/RankedCardGenerator"
import logger from "@utils/logger"
import { RankedCard } from "./model/RankedCard"
import SequelizeDBManager from "@lib/SequelizeDBManager"
import initModels from "./db/initModels"

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

        CommandManager.newCommand("topcarta", null, async (message: Message, args) => {
            const loading = await this.startLoading(message, "Cargando");
            try {
                
                const carta = await findTopCard(message.author.id);
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

            if(!isHash) {
                try {
                    const ultimaCarta = await findLastCard(message.author.id);
    
                    const lastDate = ultimaCarta.get('date');
                    const now = new Date();
                    const timeSince = now.getTime() - lastDate.getTime();
                    
                    const hoursSince = timeSince / (1000 * 60 * 60);
    
                    // Verificar si la diferencia es menor a 24 horas
                    if (hoursSince < 23) {
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
                }
                catch(error) {
                    logger.error(error);
                }
            }
    

            const loading = await this.startLoading(message, "Generando");

            try {

                let imageBuffers = [];
                
                if(isHash) {
                    let generatedCard = await generateHashCard(args[0], args[1]);
                    imageBuffers.push(generatedCard[0]);
                }
                else {
                    let generatedCard;
                    for(var i = 0; i < 4; i++) {
                        generatedCard = await generateRandomCard(message.author.username);
                        imageBuffers.push(generatedCard[0]);
                        const cardData = generatedCard[1];
                        cardData.owner = message.author.id;                        
                        saveCard(cardData);
                    }
                }
    
                this.stopLoading(loading);
    
                // Enviar carta
                for(var i = 0; i < imageBuffers.length; i++) {
                    await sendCard(message, imageBuffers[i]);
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

async function saveCard(cardData: any) {
    try {
      const sequelize =  SequelizeDBManager.getInstance();
      await sequelize.sync();
      await RankedCard.create(cardData);
    } catch (error) {
      console.error('Error al guardar la carta:', error);
    }
}

async function findTopCard(userId: string) {
    try {
      const card = await RankedCard.findOne({
        where: { owner: userId },
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