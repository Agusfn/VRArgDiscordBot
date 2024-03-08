import path from "path";
import * as fs from 'fs';


/**
 * Get commands from a folder of command files.
 * @param folderPath 
 * @returns 
 */
export const getCommandsFromFolder = (folderPath: string): any[] => {

    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    const commands: any[] = [];

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);

        console.log("command filePath", filePath);
        const command = require(filePath).default;
        console.log("contents: ", JSON.stringify(command, null, 4))

        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            //client.commands.set(command.data.name, command);
            commands.push(command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }

    return commands;
}


/**
 * Get all commands from a folder of folders of commands.
 * @param foldersPath Path of the folder that has also many folders.
 */
export const getCommandsFromFolders = (foldersPath: string): any[] => {

    //const foldersPath = path.join(__dirname, 'commands');
    
    const commandFolders = fs.readdirSync(foldersPath);
    const commands: any[] = [];

    for (const folder of commandFolders) {

        const commandsPath = path.join(foldersPath, folder);
        
        for(const command of getCommandsFromFolder(commandsPath)) {
            commands.push(command);
        }
    }

    return commands;
}

