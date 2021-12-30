import { CronFrequency } from "@ts/enums"
import * as cron from "node-cron"
import logger from "@utils/logger"

export abstract class Script {


    /**
     * The name of our script.
     */
    protected abstract scriptName: string

    /**
     * Called when the bot is ready and the Script is initialized. May be used to register commands, crons, and other events. Shall only be called by ScriptLoader.
     */
    public async onInitialized?(): Promise<void>

    /**
     * When a user sends a message.
     */
    protected abstract onUserMessage?(): void

    /**
     * Function for initializing sequelize db models on script initialization.
     */
    public abstract initDbModels?(): void


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


    public  getName() {
        return this.scriptName
    }


}