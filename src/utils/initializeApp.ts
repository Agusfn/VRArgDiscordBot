import * as dotenv from "dotenv"
import { CommandMetadata } from "@ts/interfaces"
import discordClient from "./discordClient"
import { COMMAND_PREFIX } from "@utils/configuration"
import bot = require("bot-commander")
import Sequelize from "@utils/Sequelize"

export const initializeApp = async () => {
    
    /**
     * Initialize dotenv
     */
    dotenv.config()

    /**
     * Initialize sequelize database instance.
     */
    await Sequelize.initialize()


    /**
     * Configure globally the command parser.
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
