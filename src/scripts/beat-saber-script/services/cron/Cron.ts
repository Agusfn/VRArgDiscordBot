import * as cron from "node-cron"
import logger from "@utils/logger"
import { logException } from "@utils/index"


export default abstract class Cron {

    private started = false;

    protected running = false;

    protected cronExpression: string = null;

    constructor(cronExp: string) {
        this.cronExpression = cronExp;
    }


    public start() {

        if(this.started) {
            logger.warn("Cron already started!!");
            return;
        }

        this.started = true;

        cron.schedule(this.cronExpression, async () => {
            try {
                await this.tick()
            } catch(error: any) {
                logger.error("Error during cron excecution")
                logException(error)
            }
        })

    }

    protected abstract tick(): Promise<any>; // force child classes implement this method

}