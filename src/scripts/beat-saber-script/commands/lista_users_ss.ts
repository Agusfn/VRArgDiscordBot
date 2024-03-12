import { DiscordCommand } from "@ts/interfaces";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { BeatSaberScript } from "../BeatSaberScript";
import { SSPlayer } from "../models";
import { User } from "@scripts/core-script/models/User";
import { replyLongMessageToInteraction } from "@utils/index";


export default {
	data: new SlashCommandBuilder()
		.setName('lista_users_ss')
		.setDescription('Mostrar una lista de usuarios del server con su cuenta de ScoreSaber vinculada.')
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), // mods or higher
	async execute(script, interaction) {
		
		const players = await SSPlayer.findAll({ include: User, order: [["name", "ASC"]] })

		let userListTxt = "**__Lista de usuarios con ScoreSaber vinculado:__**\n"
		for(const player of players) {
			userListTxt += `**User Discord:** ${player.User?.username || "(desvinculado)"}. **SS:** ${player.name}. **URL:** <${player.scoreSaberURL()}>\n`
		}

		await replyLongMessageToInteraction(interaction, userListTxt);

	},
} as DiscordCommand<BeatSaberScript>;
