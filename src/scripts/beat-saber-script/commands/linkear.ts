import { DiscordCommand } from "@ts/interfaces";
import { SlashCommandBuilder } from "discord.js";
import { BeatSaberScript } from "../BeatSaberScript";
import { getScoreSaberIdFromIdOrURL } from "../utils/other";


export default {
	data: new SlashCommandBuilder()
		.setName('linkear')
		.setDescription("Vincular una cuenta de ScoreSaber a tu cuenta de Discord.")
		.addStringOption(option => option
			.setName("ss_id_url")
			.setDescription("URL o id de ScoreSaber")
			.setMaxLength(100)
			.setRequired(true)),
	async execute(script, interaction) {
		
		// Validar param
		const ssIdUrl = interaction.options.getString("ss_id_url");
		const scoreSaberId = getScoreSaberIdFromIdOrURL(ssIdUrl)

		if(!scoreSaberId) {
			interaction.reply("Ingresa un ID de scoresaber o una URL de jugador de ScoreSaber válido.")
			return
		}

		const ssPlayer = await script.scoreSaberAccountManager.linkScoreSaberAccountToUser(interaction.user.id, scoreSaberId)

		if(ssPlayer) {
			interaction.reply(`La cuenta de ScoreSaber **${ssPlayer.name}** se te vinculó correctamente!`)
		} else {
			interaction.reply(script.scoreSaberAccountManager.getErrorMsg())
		}

	},
} as DiscordCommand<BeatSaberScript>;
