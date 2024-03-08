import { Script } from "./Script"
//import SequelizeDBManager from "@lib/SequelizeDBManager"
import logger from "@utils/logger"
import { camelToHyphen } from "@utils/index"
import { DiscordClientWrapper } from "./DiscordClient"
import path from "path";
import { getCommandsFromFolder } from "@utils/commandFolders";
import { getEventsFromFolder } from "@utils/eventFolders";


type ScriptConstructor = new (client: DiscordClientWrapper) => Script;


export class ScriptLoader {

    private scriptInstances: Script[] = []


    constructor(
        private discordClient: DiscordClientWrapper, 
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
            const cmdsCount = this.registerDiscordCommandsFromDir(scriptPath + "/commands", script);
            const evtsCount = this.registerDiscordEventsFromDir(scriptPath + "/events", script);

            logger.info(`Initialized ${script.getName()}! Registered ${cmdsCount} commands and ${evtsCount} events.`);
        }

    }

    public callAllScriptsOnInitialized() {
        for(const scriptInstance of this.scriptInstances) {
            if(scriptInstance.onReady) {
                scriptInstance.onReady(); // async
            }
        }
    }

    /**
     * Register the discord commands defined by all command files within a directory, to run in the context of a specific Script.
     * @param folderPath 
     * @param script 
     * @returns The amount of commands registered
     */
    public registerDiscordCommandsFromDir(folderPath: string, script: Script): number {
        const commands = getCommandsFromFolder(folderPath);
        for(const command of commands) {
            this.discordClient.registerNewCommand(command, script);
        }
        return commands.length;
    }

    /**
     * Register the discord events defined by all event files within a directory, to run in the context of a specific Script.
     * @param folderPath 
     * @param script 
     * @returns The amount of events registered
     */
    public registerDiscordEventsFromDir(folderPath: string, script: Script): number {
        const events = getEventsFromFolder(folderPath);
        for(const event of events) {
            this.discordClient.registerNewEvent(event, script);
        }
        return events.length;
    }


}