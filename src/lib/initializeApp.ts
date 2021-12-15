import DiscordTransport from "@utils/DiscordLogTransport"
import { COMMAND_PREFIX } from "@utils/configuration"
import { CommandMetadata } from "@ts/interfaces"
import SequelizeDBManager from "@lib/SequelizeDBManager"
import bot = require("bot-commander")
import logger from "@utils/logger"
import * as dotenv from "dotenv"
import initModels from "@models/initModels"
import { Discord, UserManager } from "@lib/index"
import { TextChannel } from "discord.js"


export const initializeApp = async () => {
    

    /**
     * Initialize dotenv
     */
    dotenv.config()


    /**
     * Initialize discord instance and log in (async)
     */
    await Discord.initialize(process.env.DISCORD_BOT_TOKEN, process.env.DISCORD_GUILD_ID)


    /**
     * Register global discord ready listener
     */
    Discord.getInstance().on("ready", async () => {

        // Add discord logging channel to logger
        const logChannel = await Discord.getTextChannel(process.env.DISCORD_LOG_CHANNEL_ID)
        logger.add(new DiscordTransport(logChannel))

        // Load some important Discord objects into our Discord helper
        await Discord.loadGuild()

        // Initialize user manager (duh)
        await UserManager.initialize()
    })

 
    /**
     * Configure a global discord message listener, so any message starting with "/" is parsed by bot commander (commands must be added on each script)
     */
    Discord.getInstance().on("message", message => {
         const msgText = message.content
         if(msgText.startsWith(COMMAND_PREFIX)) {
             const metadata: CommandMetadata = { message: message } // Include Discord Message object into the bot-commander command metadata so we can have it in the handler.
             bot.parse(msgText, metadata)
         }
    })


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




}
