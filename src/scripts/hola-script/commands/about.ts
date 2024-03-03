import { DiscordCommand } from "@ts/interfaces";
import { SlashCommandBuilder } from "discord.js";
import { CoreScript } from "../../core-script/CoreScript";


export default {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('Acerca del bot'),
	async execute(script, interaction) {
		
		await interaction.reply(process.env.BOT_NAME + " Bot v `"+process.env.VERSION + "` \n- Bot Desarrollado por **Agusfn**. \n- Versus y Cumpleaños por **Andres**. \n- Cartas Ranked por **Elecast**.");
		
	},
} as DiscordCommand<CoreScript>;
