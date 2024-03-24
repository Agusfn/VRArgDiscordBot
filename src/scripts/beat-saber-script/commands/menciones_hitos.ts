import { DiscordCommand } from "@ts/interfaces";
import { SlashCommandBuilder } from "discord.js";
import { BeatSaberScript } from "../BeatSaberScript";
import { SSPlayer } from "../models";


export default {
	data: new SlashCommandBuilder()
		.setName('menciones_hitos')
		.setDescription("Activar/desactivar tus menciones en los anuncios de hitos."),
	async execute(script, interaction) {

		const ssPlayer = await SSPlayer.scope({ method: ["withDiscordUserId", interaction.user.id] }).findOne()

		if(!ssPlayer) {
			interaction.reply(`Tu cuenta de scoresaber no está vinculada con tu cuenta de discord. Vinculala con /linkear <id scoresaber>.`)
			return
		}

		ssPlayer.milestoneAnnouncements = !ssPlayer.milestoneAnnouncements
		await ssPlayer.save()

		if(ssPlayer.milestoneAnnouncements) {
			interaction.reply("Se han activado las menciones de hitos de otros jugadores que involucren a tu usuario.")
		} else {
			interaction.reply("Se han desactivado las menciones de hitos de otros jugadores que involucren a tu usuario.")
		}

	},
} as DiscordCommand<BeatSaberScript>;
