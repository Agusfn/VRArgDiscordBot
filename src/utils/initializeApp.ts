import * as dotenv from "dotenv"
import { CommandMetadata } from "@ts/interfaces"
import { initialize as initializeDb } from "@database/initialize"
import discordClient from "./discordClient"
import { COMMAND_PREFIX } from "@utils/configuration"
import bot = require("bot-commander")


export const initializeApp = async () => {

    /**
     * Initialize dotenv
     */
    dotenv.config()

    /**
     * Initialize database
     */
    await initializeDb()

    /**
     * Configure command parser.
     */
    bot.prefix(COMMAND_PREFIX)
    .setSend( (meta: CommandMetadata, textMessage: string) => { // configure the communication medium between bot-commander and the user (user for error messages and validation)
        meta.message.channel.send(textMessage)
    })

    /**
     * Log into discord.
     */
    discordClient.login(process.env.BOT_TOKEN)


}