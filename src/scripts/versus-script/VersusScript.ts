import { Script } from "@lib/index"
import { Message, MessageAttachment } from "discord.js"
import { CommandManager } from "@lib/CommandManager"

export class VersusScript extends Script {

    protected scriptName = "Versus Script"

    protected onUserMessage: undefined
    public initDbModels: undefined

    public async onInitialized() {

        CommandManager.newCommand("versus", "<param1> <param2>", async (message: Message, args) => {

            const response = await fetch(`http://127.0.0.1:5000?user1=${args[0]}&user2=${args[1]}`).then(res => res.json())

            const bplistUrl = `http://127.0.0.1:5000${response['0-download']}`
            const imageUrl = `http://127.0.0.1:5000${response['1-rendered_pool']}`

            // Descargar el archivo .bplist
            const bplistResponse = await fetch(bplistUrl).then(res => res.text())

            const buffer = Buffer.from(bplistResponse, 'utf-8');

            const nodeHtmlToImage = require('node-html-to-image')

            const html = await fetch(imageUrl).then(res => res.text())

            const image = await nodeHtmlToImage({
                html: html,
                puppeteerArgs: {
                    args: ['--no-sandbox']
                }
            })


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

        }, "Descripcion del comando.",)


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