import { Script } from "@lib/index"
import { Message, TextChannel } from "discord.js"
import { CommandManager, Discord } from "@lib/index"


/**
 * The maximum amount of messages allowed to exist in a channel for indexes to be generated (to avoid accidentally generating indexes in conversation channels)
 */
const MAX_MSGS_INDEXES = 200



export class ServerHelper extends Script {

    protected scriptName = "Server Helper Script"

    protected onUserMessage: undefined
    protected initDbModels: undefined

    public onInitialized() {

        // Generate indexes command
        CommandManager.newAdminCommand("generar_indices", "<id canal>", async (userMessage: Message, args) => {

            try {
                const selectedChannel = await Discord.getTextChannel(args[0])
                if(!selectedChannel) {
                    userMessage.reply("No se encontró el canal de texto con el id indicado."); return
                }

                const channelMessages = await Discord.fetchMultipleMsgsFromChannel(args[0], MAX_MSGS_INDEXES)
                if(channelMessages.length > MAX_MSGS_INDEXES) {
                    userMessage.reply("El índice no se puede generar sobre canales con más de "+MAX_MSGS_INDEXES+" mensajes. El canal seleccionado tiene " + channelMessages.length + " mensajes."); return
                }

                // Remove previous self (bot) messages
                const botMessages = channelMessages.filter(message => message.author.id == process.env.DISCORD_BOT_USER_ID)
                for(const message of botMessages) {
                    await message.delete()
                }

                // Generate string message with index
                //let indexMarkdownText = "**__ÍNDICE__**\n\n"
                let indexMarkdownText = ""

                for(const message of channelMessages) {

                    const plainMsg = message.content.replace(/[_*`~]/g, "") // remove any text format chars, which are these: * _ ` ~
                    const titlesRegex = new RegExp("^(##?) (.*)$","gm") // matcher for titles and subtitles

                    let matches
                    while(matches = titlesRegex.exec(plainMsg)) {
                        //console.log("match", matches)
                        const title = matches[2]
                        if(matches[1] == "#") { // title
                            indexMarkdownText += `[${title}](${message.url})\n` // new line with hyperlink for title
                        } else if(matches[1] == "##") { // subtitle
                            indexMarkdownText += `\u200b \u200b \u200b|-> [${title}](${message.url})\n` // symbols at beginning are white spaces
                        }
                    }

                }

                // Submit index as last reply
                console.log(indexMarkdownText)
                selectedChannel.send({
                    embeds: [{
                        title: 'ÍNDICE',
                        description: indexMarkdownText,
                    }],
                });


            } catch(error) {
                console.log(error)
            }


        }, "Genera índices sobre un canal de texto informativo indicado.")




    }
    
}