import Script from "./Script"
import Sequelize from "@utils/Sequelize"


type ScriptSubclass = new () => Script // some weird type to represent a "newable". (constructor function that constructs a Script)

export class ScriptLoader {

    private static scriptClasses: ScriptSubclass[] = []
    private static scriptInstances: Script[] = []

    
    /**
     * Add a new script to the script loader.
     * @param scriptClass 
     */
    static registerScript(scriptClass: ScriptSubclass) {
        this.scriptClasses.push(scriptClass)
    }

    /**
     * Initialize all registered scripts.
     */
    static async initializeScripts() {
        
        // Instantiate scripts
        for(let ScriptClass of this.scriptClasses) {
            const script = new ScriptClass()
            this.scriptInstances.push(script)
            script.initialize()
        }

        // Sync the defined models on the scripts (if any) on the database
        await Sequelize.syncModels()

        // Call script initialization events (if defined)
        for(let script of this.scriptInstances) {
            if(typeof script.onInitialized == "function") {
                script.onInitialized() // (async)
            }
        }


    }


}