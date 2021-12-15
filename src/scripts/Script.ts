import { CommandActionFunction, CommandMetadata } from "@ts/interfaces"
import { CronFrequency } from "@ts/enums"
import discordClient from "@utils/discordClient"
import bot = require("bot-commander")
import * as cron from "node-cron"
import logger from "@utils/logger"

export default abstract class Script {


    private initialized = false

    /**
     * The name of our script.
     */
    protected abstract scriptName: string

    /**
     * When the bot is ready to start working.
     */
    protected abstract onDiscordReady?(): void

    /**
     * Register commands, crons, and other events. Shall only be called by ScriptLoader.
     */
    public abstract onInitialized?(): void

    /**
     * When a user sends a message.
     */
    protected abstract onUserMessage?(): void

    /**
     * Function for initializing sequelize db models on script initialization.
     */
    protected abstract initDbModels?(): void


    /**
     * Register new command in bot-commander. Must not conflict with other commands from other scripts. May be done on script onInitialize() or at runtime.
     * @param commandName 
     */
    protected addCommand(commandName: string, args: string | null, commandAction: CommandActionFunction, description?: string) {
        
        // Add the callback action for when this command is interpreted
        const cmdName = commandName + (args ? " " + args : "")
        const command = bot.command(cmdName, null)
        if(description) {
            command.description(description)
        }
        command.showHelpOnEmpty()
        .action( (metadata: CommandMetadata, ...params: any) => {
            commandAction(metadata.message, params)
        })

    }

    /**
     * Add a new cron task
     * @param frequency 
     * @param task 
     */
    protected addCron(frequency: CronFrequency, task: () => void) {
        let cronExpression

        if(frequency == CronFrequency.MINUTELY) 
            cronExpression = "0 * * * * *"
        else if(frequency == CronFrequency.HOURLY) 
            cronExpression = "0 0 * * * *"
        else // daily
            cronExpression = "0 0 0 * *"

        cron.schedule(cronExpression, task)
    }

    /**
     * Add a new cron task
     * @param frequency 
     * @param task 
     */
     protected addCustomCron(cronExpression: string, task: () => void) {
        cron.schedule(cronExpression, async () => {
            try {
                await task()
            } catch(error) {
                logger.error(error)
            }
        })
    }


    /**
     * Initialize script. Shall only be called by ScriptLoader.
     */
    public initialize() {
        
        if(this.initialized) {
            throw new Error(this.scriptName + " has already been initialized.")
        }
        this.initialized = true

        logger.info("Initializing "+this.scriptName+"!")

        // Initialize db models (if defined)
        if(typeof this.initDbModels == "function") {
            this.initDbModels()
        }

        // Register discord ready event (if needed)
        if(typeof this.onDiscordReady == "function") {
            discordClient.on("ready", this.onDiscordReady);
        }

    }


}