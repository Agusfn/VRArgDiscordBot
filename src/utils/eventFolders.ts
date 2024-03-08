import path from "path";
import * as fs from 'fs';
import logger from "./logger";
import { DiscordEvent } from "@ts/interfaces";
import { Script } from "@core/Script";


/**
 * Get commands from a folder of command files.
 * @param folderPath 
 * @returns 
 */
export const getEventsFromFolder = (folderPath: string): DiscordEvent<Script>[] => {

    if(!fs.existsSync(folderPath)) return [];

    const eventFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    const events: DiscordEvent<Script>[] = [];

    for (const file of eventFiles) {
        const filePath = path.join(folderPath, file);

        const event: DiscordEvent<Script> = require(filePath).default;

        if (event && event.name && event.execute) {
            events.push(event);
        } else {
            logger.warn(`[WARNING] The event at ${filePath} is empty or missing a required "name" or "execute" property.`);
        }
    }

    return events;
}


/**
 * Get all commands from a folder of folders of commands.
 * @param foldersPath Path of the folder that has also many folders.
 */
// export const getCommandsFromFolders = (foldersPath: string): DiscordCommand<Script>[] => {

//     //const foldersPath = path.join(__dirname, 'commands');
    
//     const commandFolders = fs.readdirSync(foldersPath);
//     const commands: DiscordCommand<Script>[] = [];

//     for (const folder of commandFolders) {

//         const commandsPath = path.join(foldersPath, folder);
        
//         for(const command of getCommandsFromFolder(commandsPath)) {
//             commands.push(command);
//         }
//     }

//     return commands;
// }
