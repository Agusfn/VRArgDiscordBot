/**
 * This script is only intended to be run when command definitions change. It uploads the new commands to the discord application server
 */

require('dotenv').config()
import "../fixTsPaths"
import { REST, RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord.js";
import { getCommandsFromFolder, getScriptCommandsFoldersPaths } from "@utils/commandFolders";
import logger from "@utils/logger";


// Obtain all commands from scripts command directories
const commandFolderPaths = getScriptCommandsFoldersPaths();

const commandDefinitions: RESTPostAPIApplicationCommandsJSONBody[] = [];
for(const path of commandFolderPaths) {
    for(const command of getCommandsFromFolder(path)) {
        commandDefinitions.push(command.data.toJSON());
    }
}


// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

// and deploy your commands!
(async () => {
	try {
		logger.info(`Started refreshing ${commandDefinitions.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data: any = await rest.put(
			Routes.applicationGuildCommands(process.env.DISCORD_BOT_USER_ID, process.env.DISCORD_GUILD_ID),
			{ body: commandDefinitions },
		);

		logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error: any) {
		// And of course, make sure you catch and log any errors!
		logger.error(error?.stack || error);
	}
})();
