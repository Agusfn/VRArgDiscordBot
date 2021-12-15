import "./fixTsPaths"
import { initializeApp } from "@lib/initializeApp"
import { ScriptLoader, MemeScript, SpicySaberScript } from "@scripts/index"
/*import logger from "@utils/logger"
import axios from "axios"*/


(async () => {

    // Initialize config, database, ORM, etc.
    await initializeApp()

    // Register and initialize scripts
    //ScriptLoader.registerScript(MemeScript)
    //ScriptLoader.registerScript(SpicySaberScript)
    await ScriptLoader.initializeScripts()



})();


/*
logger.info("Init!")
*/