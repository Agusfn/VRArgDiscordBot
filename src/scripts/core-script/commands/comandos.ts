import { DiscordCommand } from "@ts/interfaces";
import { SlashCommandBuilder } from "discord.js";
import { CoreScript } from "../CoreScript";


export default {
	data: new SlashCommandBuilder()
		.setName('comandos')
		.setDescription('Listar todos los comandos del bot'),
	async execute(script, interaction) {
		
		const groupedCommands = script.groupCommandsByScript();
		
		let text = ""
		for(const groupName of Object.keys(groupedCommands)) {
			text += "\n**__" + groupName + "__**\n"
			for(const command of groupedCommands[groupName]) {
				text += "**/" + command.data.name + "**" + (command.data.description ? ": " + command.data.description : " (sin descripción)") + "\n"
			}
		}

		await interaction.reply(text);

	},
} as DiscordCommand<CoreScript>;
