import logger from "@utils/logger";
import { Sequelize } from "sequelize";

/**
 * The sequelize connection to DB singleton instance
 */
export default new Sequelize('sqlite:'+process.env.DB_FILE, {
    logging: process.env.DB_LOG_QUERIES == "true" ? logger.info : false
});