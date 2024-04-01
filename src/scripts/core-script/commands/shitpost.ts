import { DiscordCommand } from "@ts/interfaces";
import { PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import { CoreScript } from "../CoreScript";


export default {
	data: new SlashCommandBuilder()
		.setName('shitpost')
		.setDescription('LOL april fools 24')
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), // mods or higher,
	async execute(script, interaction) {


		const message = `:checkered_flag:  **Uadyet** acaba de sobrepasar a <@200038416061169664>, quedando con rank global de #305!`;
		const outputChannel = this.script.client.getChannel(process.env.CHANNEL_ID_BEATSABER_MILESTONES) as TextChannel;
		await outputChannel.send(message)    
		//await interaction.reply(`__**SantosBot v${botVersion}**__ \n- Bot Desarrollado por **Agusfn**. \n- Versus y Cumpleaños por **Andres**. \n- Cartas Ranked por **Elecast**.`);

	},
} as DiscordCommand<CoreScript>;

