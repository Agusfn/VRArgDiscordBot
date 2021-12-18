import { Script } from "@lib/index"
import { Message, TextChannel } from "discord.js"
import { CommandManager, Discord } from "@lib/index"

export class ServerHelper extends Script {

    protected scriptName = "Server Helper Script"

    protected onUserMessage: undefined
    protected initDbModels: undefined

    public onInitialized() {

        // Generate indexes command
        CommandManager.newAdminCommand("generar_indices", "<id canal>", async (userMessage: Message, args) => {

            const selectedChannel = <TextChannel>Discord.getGuild().channels.cache.find(channel => channel.id == args[0] && channel.isText())

            if(!selectedChannel) {
                userMessage.reply("No se encontró el canal de texto con el id indicado."); return
            }

            const channelMessages = (await selectedChannel.messages.fetch({limit: 60})).sort((a, b) => a.createdAt > b.createdAt ? 1 : -1)
            if(channelMessages.size > 50) {
                userMessage.reply("El índice no se puede generar sobre canales con más de 50 mensajes."); return
            }

            // Remove previous self messages
            const botMessages = channelMessages.filter(message => message.author.id == process.env.DISCORD_BOT_USER_ID)
            for(const [msgId, message] of botMessages) {
                await message.delete()
            }

            // Generate string message with index
            let indexText = "ÍNDICE\n\n"
            for(const [msgId, message] of channelMessages) {
                const plainMsg = message.content.replace(/[_*`~]/g, "") // remove any text format chars: * _ ` ~
                const titlesRegex = new RegExp("^# (.*)$","gm")

                let match
                while(match = titlesRegex.exec(plainMsg)) {
                    indexText += match[1] + " ---> " + message.url + "\n"
                    console.log("match", match)
                }
            }

            // Submit index as last reply
            selectedChannel.send(indexText)

        }, "Genera índices sobre un canal de texto informativo indicado.")




    }
    
}