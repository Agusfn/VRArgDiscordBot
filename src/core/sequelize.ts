import logger from "@utils/logger";
import { Sequelize } from "sequelize";

export default new Sequelize('sqlite:'+process.env.DB_FILE, {
    logging: process.env.DB_LOG_QUERIES == "true" ? logger.info : false
});