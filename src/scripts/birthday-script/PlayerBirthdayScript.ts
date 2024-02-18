import { Script } from "@lib/index"
import { Message, MessageAttachment } from "discord.js"
import { CommandManager } from "@lib/CommandManager"
import { User } from "@models/index"
import { ScoreSaberAccountManager } from "@scripts/beat-saber-script/lib"

export class PlayerBirthdayScript extends Script {

    protected scriptName = "Player Birthday Script"

    protected onUserMessage: undefined
    public initDbModels: undefined

    public async onInitialized() {

        CommandManager.newCommand("bd", "<fecha cumpleaños>", async (message: Message, args) => {

            const accountManager = new ScoreSaberAccountManager()

        }, "Genera un versus entre dos usuarios", "Cumpleaños")


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