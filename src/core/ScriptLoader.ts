import { Script } from "./Script"
//import SequelizeDBManager from "@lib/SequelizeDBManager"
import logger from "@utils/logger"
import { camelToHyphen } from "@utils/index"
import { DiscordManager } from "./DiscordManager"
import path from "path";


type ScriptConstructor = new () => Script;


export class ScriptLoader {

    private scriptInstances: Script[] = []


    constructor(
        private discordManager: DiscordManager, 
        private scriptClasses: ScriptConstructor[]
    ) {

    }

    /**
     * Initialize all registered scripts.
     */
    public async initializeScripts() {
        
        // Instantiate scripts
        for(let ScriptClass of this.scriptClasses) {

            const script = new ScriptClass()
            this.scriptInstances.push(script)

            // Register commands of this script
            const commandsDirPath = path.join(__dirname, "../scripts/" + camelToHyphen(ScriptClass.name) + "/commands");
            this.discordManager.registerCommandsFromFolder(commandsDirPath);

            /*if(typeof script.initDbModels == "function") {
                script.initDbModels()
            }*/
        }

        logger.info("All models initialized. Synchronizing...")
        // Once all scripts were initialized, sync the new models (if any) in DB
        //await SequelizeDBManager.syncModels()

        // Call script onInitialized events defined by the user (if exists)
        // for(let script of this.scriptInstances) {
        //     this.callScriptOnInitialized(script) // (async)
        // }
    }






    /**
     * Call "onInitialized" for a script, asynchronously, catching any error that may appear.
     * @param script 
     */
    // private async callScriptOnInitialized(script: Script) {
    //     if(typeof script.onInitialized == "function") {
    //         try {
    //             await script.onInitialized() // custom defined initialization per-script
    //             logger.info("Initialized "+script.getName()+"!")
    //         } catch(error: any) {
    //             logger.error("Error executing onInitialized() on script " + script.getName())
    //             logException(error)
    //         }
    //     }
    // }


}