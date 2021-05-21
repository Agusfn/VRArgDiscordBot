import { Sequelize } from "sequelize"
import { UserScheme } from "./schemes/index"

/**
 * Initialize sequelize ORM with sqlite3 databse
 */
export const initialize = async () => {

    const sequelize = new Sequelize('sqlite:'+process.env.DB_FILE, {
        logging: console.log
    });

    // Initialize models
    UserScheme.init(sequelize)

    // Test connection
    await sequelize.authenticate()
    console.log('DB Connection has been established successfully.')

    // Sync models with db (what does it do?)
    await sequelize.sync()
}