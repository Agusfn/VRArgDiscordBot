import { Script } from "./Script"
import SequelizeDBManager from "@lib/SequelizeDBManager"


type ScriptSubclass = new () => Script // some weird type to represent a "newable". (constructor function that constructs a Script)

export class ScriptLoader {

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
            script.initialize() // initializes DB models (if any)
        }

        // Once all scripts were initialized, sync the new models (if any) in DB
        await SequelizeDBManager.syncModels()

        // Call script initialization events (if defined)
        for(let script of this.scriptInstances) {
            if(typeof script.onInitialized == "function") {
                script.onInitialized() // (async)
            }
        }


    }


}