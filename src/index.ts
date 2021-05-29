import "./fixTsPaths"
import { initializeApp } from "@utils/initializeApp"
import { ScriptLoader, MemeScript, SpicySaberScript } from "@scripts/index"
import Sequelize from "@utils/Sequelize"
/*import logger from "@utils/logger"
import axios from "axios"*/


(async () => {

    // Initialize config, database, ORM, etc.
    await initializeApp()

    // Register and initialize scripts
    ScriptLoader.registerScript(MemeScript)
    ScriptLoader.registerScript(SpicySaberScript)
    ScriptLoader.initializeScripts()

    // Sync the defined models on the scripts (if any) on the database
    await Sequelize.syncModels()

})();


/*
logger.info("Init!")
*/