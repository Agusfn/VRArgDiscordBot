import { CronFrequency } from "@ts/enums"
import * as cron from "node-cron"
import logger from "@utils/logger"
import { logException } from "@utils/index"

export abstract class Script {


    /**
     * The name of our script.
     */
    protected abstract scriptName: string

    
}