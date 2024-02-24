import { Script } from "@lib/index"
import { Message, MessageAttachment } from "discord.js"
import { CommandManager } from "@lib/CommandManager"
import axios from "axios"

export class VersusScript extends Script {

    protected scriptName = "Versus Script"

    protected onUserMessage: undefined
    public initDbModels: undefined

    public async onInitialized() {

        CommandManager.newCommand("versus", "<scoresaber id> <scoresaber id>", async (message: Message, args) => {

            if (args.length !== 3) {
                message.reply("Debes ingresar dos usuarios.")
                return
            }

            const loadingMessage = await message.channel.send("Loading");

            // Definir los puntos que se van a mover en el mensaje de carga
            const loadingPoints = ['.', '..', '...'];
            let index = 0;

            // Función para actualizar el mensaje de carga con los puntos que se mueven
            const updateLoadingMessage = () => {
                loadingMessage.edit(`Loading${loadingPoints[index]}`);
                index = (index + 1) % loadingPoints.length;
            };

            // Actualizar el mensaje de carga cada segundo
            const intervalId = setInterval(updateLoadingMessage, 1000);

            try {
                
                // Hacer la llamada al servidor
                const response: any = await axios.get(`http://127.0.0.1:5000?user1=${args[0]}&user2=${args[1]}`).then(res => res.data)
    
                const bplistUrl = `http://127.0.0.1:5000${response['0-download']}`
                const imageUrl = `http://127.0.0.1:5000${response['1-rendered_pool']}`
    
                // Descargar el archivo .bplist
                const bplistResponse = await axios.get(bplistUrl).then(res => res.data)
    
                const buffer = Buffer.from(bplistResponse, 'utf-8');
    
                const nodeHtmlToImage = require('node-html-to-image')
    
                const html = await axios.get(imageUrl).then(res => res.data)
    
                const image = await nodeHtmlToImage({
                    html: html,
                    puppeteerArgs: {
                        args: ['--no-sandbox']
                    }
                })
    
                // Limpiar el intervalo y detener el efecto de carga
    
                clearInterval(intervalId);
                loadingMessage.delete();
    
                // Enviar el archivo adjunto como respuesta
                await message.channel.send({
                    files: [
                        {
                            attachment: buffer,
                            name: `${response['3-filename']}.bplist`
                        },
                        {
                            attachment: image,
                            name: `${response['3-filename']}.png`
                        }
                    ]
                });
            } catch (error) {
                clearInterval(intervalId);
                loadingMessage.delete();
                message.reply("Hubo un error al intentar generar el versus.")
            }


        }, "Genera un versus entre dos usuarios", "Versus")


        CommandManager.newCommand("coinflip", "", async (message: Message, args) => {
            const caras = ["Cara", "Cruz"]
            const random = Math.floor(Math.random() * caras.length)
            message.reply(caras[random])
        }, "Tira una moneda", "Versus")
    }
    
}

// Create a buffer with custom content
// const fileContent = 'This is custom text content.';
// const buffer = Buffer.from(fileContent, 'utf-8');

// // Send the buffer as an attachment
// await message.channel.send({
//     files: [
//         {
//             attachment: buffer,
//             name: 'customfile.txt'
//         }
//     ]
// });