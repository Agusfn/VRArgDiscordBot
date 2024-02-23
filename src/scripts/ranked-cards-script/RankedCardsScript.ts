import { Script } from "@lib/index"
import { Message, MessageButton, MessageActionRow } from "discord.js"
import { CommandManager } from "@lib/CommandManager"
import { generateHashCard, generateRandomCard } from "./utils/RankedCardGenerator"
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
                    let imageBuffer = carta.get('image');
                    sendCard(message, imageBuffer);
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

        CommandManager.newCommand("cartas", "[hash] [diff]", async (message: Message, args) => {

            const loading = await this.startLoading(message, "Generando");

            try {
                
                let imageBuffers = [];
                
                if(args.length >=2 && args[0] != null) {
                    let generatedCard = await generateRandomCard(message.author.username);
                    imageBuffers.push(generatedCard[0]);
                }
                else {
                    let generatedCard;
                    for(var i = 0; i < 4; i++) {
                        generatedCard = await generateRandomCard(message.author.username);
                        imageBuffers.push(generatedCard[0]);
                        const cardData = {
                            owner: message.author.id,
                            date: new Date(),
                            value: generatedCard[1],
                            image: generatedCard[0]
                        };
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


        }, "Genera una carta ranked", "Ranked Cards")
    }
}

async function sendCard(message: Message, imageBuffer: any) {
    await message.channel.send({ 
        files: [{
                attachment: imageBuffer,
                name: "card.png" 
        }]});
}

async function saveCard(cardData: { owner: string; date: Date; value: number; image: Blob }) {
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
        order: [['value', 'DESC']],
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