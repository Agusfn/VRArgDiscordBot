import { Script } from "./Script"
import SequelizeDBManager from "@lib/SequelizeDBManager"
import logger from "@utils/logger"
import { logException } from "@utils/index"


type ScriptSubclass = new () => Script // some weird type to represent a "newable". (constructor function that constructs a Script)

export class ScriptLoaderNew {

    private static scriptClasses: ScriptSubclass[] = []
    private static scriptInstances: Script[] = []

    
    /**
     * Add a new script to the script loader.
     * @param scriptClass 
     */
    public static registerScript(scriptClass: ScriptSubclass) {
        this.scriptClasses.push(scriptClass)
    }

    /**
     * Initialize all registered scripts.
     */
    public static async initializeScripts() {
        
        // Instantiate scripts
        for(let ScriptClass of this.scriptClasses) {

            const script = new ScriptClass()
            this.scriptInstances.push(script)

            if(typeof script.initDbModels == "function") {
                script.initDbModels()
            }
        }

        logger.info("All models initialized. Synchronizing...")
        // Once all scripts were initialized, sync the new models (if any) in DB
        await SequelizeDBManager.syncModels()

        // Call script onInitialized events defined by the user (if exists)
        for(let script of this.scriptInstances) {
            this.callScriptOnInitialized(script) // (async)
        }
    }


    /**
     * Call "onInitialized" for a script, asynchronously, catching any error that may appear.
     * @param script 
     */
    private static async callScriptOnInitialized(script: Script) {
        if(typeof script.onInitialized == "function") {
            try {
                await script.onInitialized() // custom defined initialization per-script
                logger.info("Initialized "+script.getName()+"!")
            } catch(error: any) {
                logger.error("Error executing onInitialized() on script " + script.getName())
                logException(error)
            }
        }
    }


}