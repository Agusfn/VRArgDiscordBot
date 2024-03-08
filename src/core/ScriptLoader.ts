import { Script } from "./Script"
//import SequelizeDBManager from "@lib/SequelizeDBManager"
import logger from "@utils/logger"
import { camelToHyphen } from "@utils/index"
import { DiscordClient } from "./DiscordClient"
import path from "path";
import { getCommandsFromFolder } from "@utils/commandFolders";
import { getEventsFromFolder } from "@utils/eventFolders";


type ScriptConstructor = new (client: DiscordClient) => Script;


export class ScriptLoader {

    private scriptInstances: Script[] = []


    constructor(
        private discordClient: DiscordClient, 
        private scriptClasses: ScriptConstructor[]
    ) {

    }

    /**
     * Initialize all registered scripts.
     */
    public async initializeScripts() {
        
        // Instantiate scripts
        for(let ScriptClass of this.scriptClasses) {

            const script = new ScriptClass(this.discordClient);
            this.scriptInstances.push(script);

            // Register Discord commands and events of this script
            const scriptPath = path.join(__dirname, "../scripts/" + camelToHyphen(ScriptClass.name));
            this.registerDiscordCommandsFromDir(scriptPath + "/commands", script);
            this.registerDiscordEventsFromDir(scriptPath + "/events", script);


            /*if(typeof script.initDbModels == "function") {
                script.initDbModels()
            }*/

            logger.info(`Initialized ${script.getName()}!`);
        }

        //logger.info("All models initialized. Synchronizing...")
        // Once all scripts were initialized, sync the new models (if any) in DB
        //await SequelizeDBManager.syncModels()


    }

    /**
     * Register the discord commands defined by all command files within a directory, to run in the context of a specific Script.
     * @param folderPath 
     * @param script 
     */
    public registerDiscordCommandsFromDir(folderPath: string, script: Script) {
        const commands = getCommandsFromFolder(folderPath);
        for(const command of commands) {
            this.discordClient.registerNewCommand(command, script);
        }
    }

    /**
     * Register the discord events defined by all event files within a directory, to run in the context of a specific Script.
     * @param folderPath 
     * @param script 
     */
    public registerDiscordEventsFromDir(folderPath: string, script: Script) {
        const events = getEventsFromFolder(folderPath);
        for(const event of events) {
            this.discordClient.registerNewEvent(event, script);
        }
    }


}