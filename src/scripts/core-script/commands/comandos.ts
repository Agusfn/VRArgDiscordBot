import { DiscordCommand } from "@ts/interfaces";
import { ApplicationCommandOptionType, PermissionsBitField, SlashCommandBuilder } from "discord.js";
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

			for(const { data: cmdData } of groupedCommands[groupName]) {

				// Skip this command if the user does not have the command permission to execute it
				const memberPerms = interaction.member.permissions as PermissionsBitField;
				if(cmdData.default_member_permissions && !memberPerms.has(cmdData.default_member_permissions as any)) {
					continue;
				}

				text += "**/" + cmdData.name + "**";

				const subcommandList = getSubcommandList(cmdData);
				if(subcommandList) { // command has subcommands
					text += " _`subcomando`_";
				} else { // command has normal parameters
					text += getCommandParamList(cmdData);
				}
				text += (cmdData.description ? ": " + cmdData.description : " (sin descripción)") + "\n";

				// Append subcommand list
				if(subcommandList) {
					text += subcommandList + "\n";
				}
			}
		}

		await interaction.reply({ content: text, ephemeral: true });
	},
} as DiscordCommand<CoreScript>;



const getSubcommandList = (command: SlashCommandBuilder) => {

	let list = "";
	for(const option of command.options.map(op => op.toJSON())) {

		if(option.type == ApplicationCommandOptionType.Subcommand) {
			list += `_   _\- **${option.name}**${getCommandParamList(option as any)}: ` + option.description + "\n";
		}
	}

	return list || null;
}


const getCommandParamList = (command: SlashCommandBuilder): string => {
	
	let list = "";

	if(command.options.length > 0) {

		const options: any[] = command.options[0].toJSON ? command.options.map(op => op.toJSON()) : command.options;

		for(const option of options) {
			if(option.type != ApplicationCommandOptionType.Subcommand && option.type != ApplicationCommandOptionType.SubcommandGroup) {
				list += " _`"+option.name+"`_";
			}
		}

	}

	return list;
}