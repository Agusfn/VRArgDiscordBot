import { DiscordCommand } from "@ts/interfaces";
import { SlashCommandBuilder } from "discord.js";
import { CoreScript } from "../CoreScript";


export default {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('Acerca del bot'),
	async execute(script, interaction) {

		const botVersion = require('./package.json').version;
		await interaction.reply(`SantosBot v${botVersion} \n- Bot Desarrollado por **Agusfn**. \n- Versus y Cumpleaños por **Andres**. \n- Cartas Ranked por **Elecast**.`);

	},
} as DiscordCommand<CoreScript>;

