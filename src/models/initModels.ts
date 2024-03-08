import initUsers from "./scheme/initUsers"
import setRelationships from "./scheme/setRelationships"
import logger from "@utils/logger"
import SequelizeDBManager from "@lib/SequelizeDBManager"


/**
 * Entry point for loading sequelize model schemes
 */
export default async () => {

    // Initialize models
    initUsers()
    

    /**
     * Set relationships between models.
     */
    setRelationships()

    await SequelizeDBManager.syncModels()

    logger.info("Global models initialized!")


}

