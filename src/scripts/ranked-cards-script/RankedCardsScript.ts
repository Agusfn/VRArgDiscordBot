import { Script } from "@lib/index"
import { Message, MessageAttachment } from "discord.js"
import { CommandManager } from "@lib/CommandManager"
import { generateHashCard, generateRandomCard } from "./utils/RankedCardGenerator"

export class RankedCardsScript extends Script {

    protected scriptName = "Ranked Cards Script"

    protected onUserMessage: undefined
    public initDbModels: undefined

    public async onInitialized() {

        CommandManager.newCommand("drawcard", "[hash] [diff]", async (message: Message, args) => {

            const loadingMessage = await message.channel.send("Generando");

            // Definir los puntos que se van a mover en el mensaje de carga
            const loadingPoints = ['.', '..', '...'];
            let index = 0;

            // Función para actualizar el mensaje de carga con los puntos que se mueven
            const updateLoadingMessage = () => {
                loadingMessage.edit(`Generando${loadingPoints[index]}`);
                index = (index + 1) % loadingPoints.length;
            };

            // Actualizar el mensaje de carga cada segundo
            const intervalId = setInterval(updateLoadingMessage, 1000);

            try {
                
                let imageBuffer;

                if(args.length >=2) {
                    imageBuffer = generateHashCard(args[0], args[1]);
                }
                else {
                    imageBuffer = generateRandomCard("test");
                }
    
                // Limpiar el intervalo y detener el efecto de carga
    
                clearInterval(intervalId);
                loadingMessage.delete();
    
                // Enviar el archivo adjunto como respuesta
                const cardImage = new MessageAttachment(imageBuffer, 'card.png');
                message.channel.send({ files: [cardImage] });

            } catch (error) {
                clearInterval(intervalId);
                loadingMessage.delete();
                message.reply("Hubo un error al intentar generar la carta.")
            }


        }, "Genera una carta ranked", "Ranked Cards")
    }
}