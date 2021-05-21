import Script from "./Script"


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
    static initializeScripts() {
        for(let ScriptClass of this.scriptClasses) {
            const script = new ScriptClass()
            this.scriptInstances.push(script)
            script.initialize()
        }
    }


}