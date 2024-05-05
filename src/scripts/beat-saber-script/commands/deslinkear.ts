import { DiscordCommand } from "@ts/interfaces";
import { SlashCommandBuilder } from "discord.js";
import { BeatSaberScript } from "../BeatSaberScript";


export default {
	data: new SlashCommandBuilder()
		.setName('deslinkear')
		.setDescription("Desvincular la cuenta de ScoreSaber de tu cuenta de Discord."),
	async execute(script, interaction) {
		
		const ssPlayer = await script.scoreSaberAccountManager.unlinkScoreSaberAccountFromUser(true, null, interaction.user.id)

		if(ssPlayer) {
			interaction.reply(`La cuenta de ScoreSaber **${ssPlayer.name}** (ID ${ssPlayer.id}) se te desvinculó correctamente!`)
		} else {
			interaction.reply(script.scoreSaberAccountManager.getErrorMsg())
		}

	},
} as DiscordCommand<BeatSaberScript>;
