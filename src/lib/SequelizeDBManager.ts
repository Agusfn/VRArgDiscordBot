/**
 * This file should be imported AFTER dotenv initialization.
 */

import { DATABASE_BACKUP_FRECUENCY_DAYS } from "@utils/configuration"
import { Sequelize as SequelizeDB } from "sequelize"
import logger from "@utils/logger"
import * as cron from "node-cron"
import FileBackupRotator from "@utils/FileBackupRotator"


/**
 * Class to handle Sequelize instance and testing functions.
 */
export default class SequelizeDBManager {


    /**
     * Sequelize connection instance.
     */
    private static sequelize: SequelizeDB = null


    private static maintenanceClosed = false


    public static getInstance() {
        return this.sequelize
    }
    
    /**
     * Initialize sequelize DB
     */
    public static async initialize() {

        if(this.sequelize != null) {
            throw Error("The DB has already been instantiated!")
        }
        this.sequelize = new SequelizeDB('sqlite:'+process.env.DB_FILE, {
            logging: /*console.log*/false
        });

        // Test connection
        await this.sequelize.authenticate()

        logger.info("Sequelize DB initialized and authenticated (db file "+process.env.DB_FILE+").")
    }


    /**
     * Set up the maintenance cron
     */
    public static async setMaintenanceCron() {

        cron.schedule(`0 0 */${DATABASE_BACKUP_FRECUENCY_DAYS} * *`, async () => {
            //cron.schedule(`* * * * *`, async () => {
                try {
                    await this.closeForMaintenance()
                    logger.info("DB Connection closed for maintenance")
                    logger.info("Doing database backup...")
                    FileBackupRotator.backupFile(process.env.DB_FILE, "databases", DATABASE_BACKUP_FRECUENCY_DAYS)
                    await this.initialize()
                    logger.info("DB Connection reopened!")
                } catch(error) {
                    console.log(error)
                }
            })

    }


    /**
     * Sync the defined models on the db.
     */
    public static async syncModels() {
        await this.sequelize.sync()
    }

    /**
     * 
     */
    public static async closeForMaintenance() {
        this.maintenanceClosed = true
        await this.sequelize.close()
        this.sequelize = null
    }

}
    