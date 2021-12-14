import DiscordTransport from "@utils/DiscordLogChannelTransport"
import { COMMAND_PREFIX } from "@utils/configuration"
import { CommandMetadata } from "@ts/interfaces"
import discordClient from "../utils/discordClient"
import SequelizeDBManager from "@lib/SequelizeDBManager"
import bot = require("bot-commander")
import logger from "@utils/logger"
import * as dotenv from "dotenv"
import initModels from "@models/initModels"


export const initializeApp = async () => {
    
    /**
     * Initialize dotenv
     */
    dotenv.config()


    /**
     * Add discord logging transport
     */
    if(process.env.DISCORD_CHANNEL_LOGGING == "true") {
        logger.add(new DiscordTransport())
    }
   

    /**
     * Initialize sequelize database instance.
     */
    await SequelizeDBManager.initialize()
    SequelizeDBManager.setMaintenanceCron()


    /**
     * Initialize global (application-wide) models
     */
    await initModels()


    /**
     * Configure globally the bot-commander command parser.
     */
    bot.prefix(COMMAND_PREFIX)
    .setSend( (meta: CommandMetadata, textMessage: string) => { // configure the communication medium between bot-commander and the user (user for error messages and validation)
        meta.message.channel.send(textMessage)
    })


    /**
     * Log into discord.
     */
    discordClient.login(process.env.BOT_TOKEN)

    
    /**
     * Configure a global discord message listener, so any message starting with "/" is parsed by bot commander (commands must be added on each script)
     */
    discordClient.on("message", function(message) {
        const msgText = message.content
        if(msgText.startsWith(COMMAND_PREFIX)) {
            const metadata: CommandMetadata = { message: message } // Include Discord Message object into the bot-commander command metadata so we can have it in the handler.
            bot.parse(msgText, metadata)
        }
    });


}
