//import { Script } from "./ScriptNew"
import SequelizeDBManager from "@lib/SequelizeDBManager"
import logger from "@utils/logger"
import { logException } from "@utils/index"
import { CommandManager } from "@lib/CommandManager"
import { CommandDefinition, Script, ScriptClass } from "@ts/interfaces"
import { Container } from 'typedi';



export class ScriptLoader {

    private static scriptClasses: ScriptClass[] = []
    private static scriptInstances: Script[] = []

    
    /**
     * Add a new script to the script loader.
     * @param scriptClass 
     */
    public static registerScript(scriptClass: ScriptClass) {
        this.scriptClasses.push(scriptClass)
    }

    /**
     * Initialize all registered scripts.
     */
    public static async initializeScripts() {
        
        // Instantiate scripts
        for(let ScriptClass of this.scriptClasses) {

            // Instantiate script and insert it into the dependency injection container.
            const script = Container.get(ScriptClass);
            this.scriptInstances.push(script)

            // Initialize DB models of this script
            if(typeof script.initDbModels == "function") {
                script.initDbModels()
            }

            // Register the commands for this script (if commands were defined)
            this.registerCommandsForScript(script);
        }

        logger.info("All script models initialized. Synchronizing DB...")
        // Once all scripts were initialized, sync the new models (if any) in DB
        await SequelizeDBManager.syncModels()

        logger.info("All scripts have been loaded. Calling individual initialization methods...")
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
                logger.info(script.name+" custom initialization called!")
            } catch(error: any) {
                logger.error("Error executing onInitialized() on script " + script.name)
                logException(error)
            }
        }
    }


    private static registerCommandsForScript(script: Script) {

        if(script.commands) {
            for(const command of script.commands) {

                this.validateCommandDefinition(command);

                // @ts-ignore
                let action = script[command.action];
                if(typeof action == "function") {
                    
                    action = action.bind(script); // bind the context of the callback function to its script.

                    if(command.isAdmin) {
                        CommandManager.newAdminCommand(command.cmd, command.args, action, command.description, command.groupName);
                    } else {
                        CommandManager.newCommand(command.cmd, command.args, action, command.description, command.groupName, command.restrictedChannelId);
                    }

                } else {
                    throw new Error("Error while registering command '"+command.cmd+"' for script "+script.name+". Action '"+command.action+"' does not exist on said script");
                }


            }
        }

    }


    private static validateCommandDefinition(cmdDef: CommandDefinition) {
        
    }


}