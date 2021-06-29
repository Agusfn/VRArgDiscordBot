import * as dotenv from "dotenv"
import { CommandMetadata } from "@ts/interfaces"
import discordClient from "./discordClient"
import { COMMAND_PREFIX } from "@utils/configuration"
import bot = require("bot-commander")
import Sequelize from "@utils/Sequelize"
import * as cron from "node-cron"
import { DATABASE_BACKUP_FRECUENCY_DAYS } from "@utils/configuration"
import FileBackupRotator from "@utils/FileBackupRotator"

export const initializeApp = async () => {
    
    /**
     * Initialize dotenv
     */
    dotenv.config()

    /**
     * Initialize sequelize database instance.
     */
    await Sequelize.initialize()

    //cron.schedule(`* * */${DATABASE_BACKUP_FRECUENCY_DAYS} * *`, async () => {
    cron.schedule(`* * * * *`, async () => {
        try {
            await Sequelize.closeForMaintenance()
            console.log("DB Connection closed for maintenance")
    
            
            console.log("Doing database backup...")
            FileBackupRotator.backupFile(process.env.DB_FILE, "databases")
    
    
            await Sequelize.initialize()
            console.log("DB Connection reopened!")
        } catch(error) {
            console.log(error)
        }
    })



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
