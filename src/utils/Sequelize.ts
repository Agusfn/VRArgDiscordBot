/**
 * This file should be imported AFTER dotenv initialization.
 */

import { Sequelize as SequelizeDB } from "sequelize"

/**
 * Class to handle Sequelize instance and testing functions.
 */
export default class Sequelize {

    private static sequelize: SequelizeDB = null

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
            logging: console.log
        });

        // Test connection
        await this.sequelize.authenticate()

        console.log("Sequelize DB initialized and authenticated (db file "+process.env.DB_FILE+").")
    }

    /**
     * Sync the defined models on the db.
     */
    public static async syncModels() {
        await this.sequelize.sync()
    }

}
    