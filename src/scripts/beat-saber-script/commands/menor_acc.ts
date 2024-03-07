import { DiscordCommand } from "@ts/interfaces";
import { SlashCommandBuilder } from "discord.js";
import { BeatSaberScript } from "../BeatSaberScript";
import { PlayerScore, SSPlayer } from "../models";
import { replyLongMessageToInteraction, roundNumber } from "@utils/index";
import { formatAcc } from "../utils/other";

const AMOUNT_OF_SCORES = 100

export default {
	data: new SlashCommandBuilder()
		.setName('menor_acc')
		.setDescription("Ver tu top "+AMOUNT_OF_SCORES+" scores de maps ranked con menos accuracy."),
	async execute(script, interaction) {
		
		// get scoresaber player id
		const ssPlayer = await SSPlayer.scope({ method: ["withDiscordUserId", interaction.user.id] }).findOne()

		if(!ssPlayer) {
			interaction.reply(`Tu cuenta de scoresaber no está vinculada con tu cuenta de discord. Vinculala con /linkear <id scoresaber>.`)
			return
		}

		const scores = await PlayerScore.scope({ method: ["leastAccuracy", ssPlayer.id, AMOUNT_OF_SCORES] }).findAll()
		
		let list = "**__Top "+AMOUNT_OF_SCORES+" scores con menos accuracy de "+ssPlayer.name+":__**\n"
		for(const score of scores) {
			if(!score.Leaderboard) continue
			list += "**" + formatAcc(score.accuracy) + "** ("+roundNumber(score.pp, 1)+"pp) en " + score.Leaderboard.readableMapDesc() + "\n"
		}

		await replyLongMessageToInteraction(interaction, list);

	},
} as DiscordCommand<BeatSaberScript>;
