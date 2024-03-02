import { Script } from "./Script"
//import SequelizeDBManager from "@lib/SequelizeDBManager"
import logger from "@utils/logger"
import { camelToHyphen, logException } from "@utils/index"
import { DiscordManager } from "./DiscordManager"
import path from "path";
import { getCommandsFromFolder } from "@utils/scriptFolders";


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

            // Load commands
            const commands = this.getCommandsOfScript(ScriptClass);


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


    getCommandsOfScript(scriptClass: ScriptConstructor) {
        console.log("ScriptClass name", scriptClass.name);
        const commandsDirPath = path.join(__dirname, this.getDirPathOfScriptName(scriptClass.name) + "/commands");
        console.log("commandsDirPath path ", commandsDirPath)
        const commands = getCommandsFromFolder(commandsDirPath);
        console.log("commands", commands);
    }

    getDirPathOfScriptName(scriptClassName: string): string {
        return "../scripts/" + camelToHyphen(scriptClassName);
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