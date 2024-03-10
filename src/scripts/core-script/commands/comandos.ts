import { DiscordCommand } from "@ts/interfaces";
import { APIApplicationCommandOption, ApplicationCommandOptionType, PermissionsBitField, SlashCommandBuilder } from "discord.js";
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

			for(const { data } of groupedCommands[groupName]) {


				console.log("command", data.name);
				console.log("perm", data.default_member_permissions);
				const perm = interaction.member.permissions as PermissionsBitField;
				if(perm.has(data.default_member_permissions as any)) {
					console.log("HAS PERM")
				} else {
					console.log("NO PERM")
				}



				//console.log("options", JSON.stringify(data.options, null, 4));

				const subcommandList = getSubcommandList(data);

				text += "**/" + data.name + "**";
				if(subcommandList) {
					text += " _`subcomando`_";
				} else {
					text += getCommandParamList(data);
				}
				text += (data.description ? ": " + data.description : " (sin descripción)") + "\n";

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