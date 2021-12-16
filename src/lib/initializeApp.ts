import DiscordTransport from "@utils/DiscordLogTransport"
import { COMMAND_PREFIX } from "@utils/configuration"
import { CommandMetadata } from "@ts/interfaces"
import SequelizeDBManager from "@lib/SequelizeDBManager"
// @ts-ignore
import bot = require("bot-commander")
import logger from "@utils/logger"
import * as dotenv from "dotenv"
import initModels from "@models/initModels"
import { Discord, UserManager } from "@lib/index"
import { ScriptLoader } from "./ScriptLoader"
import { GuildMember, Message } from "discord.js"

export const initializeApp = () => {
    

    /**
     * Initialize dotenv
     */
    dotenv.config()


    /**
     * Initialize discord instance and log in (async)
     */
    Discord.initialize(process.env.DISCORD_BOT_TOKEN, process.env.DISCORD_GUILD_ID)


    /**
     * Register global discord ready listener
     */
    Discord.getInstance().on("ready", async () => {
        try {
            // Add discord logging channel to logger
            const logChannel = await Discord.getTextChannel(process.env.DISCORD_LOG_CHANNEL_ID)
            logger.add(new DiscordTransport(logChannel))

            logger.info("Discord Client Logged In successfully!")

            // Initialize sequelize database connection
            await SequelizeDBManager.initialize()

            // Initialize global (application-wide) models
            await initModels()

            // Load some important Discord objects into our Discord helper
            await Discord.loadGuild()

            // Initialize user manager and load unregistered users
            await UserManager.initialize()

            // Initialize the user defined scripts
            await ScriptLoader.initializeScripts()
        } catch(error) {
            logger.error("Error initializing bot.", error)
            closeApp()
        }
    })


    Discord.getInstance().on('guildMemberAdd', member => {
        UserManager.onMemberJoined(member)
    });


    Discord.getInstance().on('guildMemberRemove', member => {
        UserManager.onMemberLeft(<GuildMember>member)
    });


    /**
     * Configure a global discord message listener, so any message starting with "/" is parsed by bot commander (commands must be added on each script)
     */
    Discord.getInstance().on("messageCreate", (message: Message) => {

        console.log(message)
        logger.info(message)

        //console.log("message by: " + message.author.username + " content: " + message.content)
        /*const msgText = message.content
        if(msgText.startsWith(COMMAND_PREFIX)) {
            const metadata: CommandMetadata = { message: message } // Include Discord Message object into the bot-commander command metadata so we can have it in the handler.
            bot.parse(msgText, metadata)
            console.log("parsed command!")
        }*/
    })


    /**
     * Configure globally the bot-commander command parser.
     */
    bot
    .prefix(COMMAND_PREFIX) // "/" prefix for commands
    .setSend((meta: CommandMetadata, textMessage: string) => { // set up communication medium from bot-commander to the user (discord channel message)
        meta.message.channel.send(textMessage)
    })


    /**
     * Register exit event, to close services gracefully
     */
    process.on('SIGINT', function() {
        closeApp()
    });

}


const closeApp = () => {
    SequelizeDBManager.getInstance()?.close()
    Discord.getInstance()?.destroy()
    process.exit()
}