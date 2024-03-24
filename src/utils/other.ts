import { ChatInputCommandInteraction, TextChannel } from "discord.js";
import logger from "./logger"
import { separateMultiLineString } from "./strings";


export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * Custom function to log errors, since different libraries throw different data types for error callbacks.
 * @param error 
 */
export const logException = (error: any) => {

    if(typeof error == "string") { // some libraries, like node cron, throw strings
        logger.error(error)
    } else if(typeof error == "object") { // Exeption, probably

        if(error?.name && (<string>error.name).toLowerCase().includes("sequelize")) { // is a sequelize exception (they are loaded with data)

            if(typeof error.errors == "object") {
                logger.error("Sequelize error: " + error.errors.map((error: any) => error.message).join(", "))
            }

            if(process.env.DEBUG == "true") {
                console.log(error) // show a bunch of data of sequelize error
            }
        } else {
            logger.error(error)

            if(error.stack) {
                logger.error(error?.stack)
            }
        }
    }

}

export const replyLongMessageToInteraction = async (interaction: ChatInputCommandInteraction, messageContent: string) => {
        
    const messagesContents = separateMultiLineString(messageContent, 1900) // message content limit is 2000

    for(let i = 0; i < messagesContents.length; i++) {
        if(i == 0) { // first response is reply of interaction to acknowledge command
            await interaction.reply(messagesContents[i]);
        } else { // subsequent are just normal messages
            await interaction.channel.send(messagesContents[i]);
        }
    }
}


export const sendLongMessageToChannel = async (channel: TextChannel, messageContent: string) => {
        
    const messagesContents = separateMultiLineString(messageContent, 1900) // message content limit is 2000

    for(const messageContent of messagesContents) {
        await channel.send(messageContent)
    }
}