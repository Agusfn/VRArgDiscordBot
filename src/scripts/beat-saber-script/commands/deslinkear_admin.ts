import { DiscordCommand } from "@ts/interfaces";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { BeatSaberScript } from "../BeatSaberScript";
import { SSPlayer } from "../models";


export default {
	data: new SlashCommandBuilder()
		.setName('deslinkear_admin')
		.setDescription("Desvincularle el usuario de Discord a una cuenta de jugador de ScoreSaber en el bot")
		.addUserOption(option => option
			.setName("discord_user")
			.setDescription("Usuario de discord a desvincular su cuenta de ScoreSaber"))
		.addStringOption(option => option
			.setName("discord_user_id")
			.setDescription("ID del usuario de discord a desvincular"))
		.addStringOption(option => option
			.setName("scoresaber_id")
			.setDescription("Id del jugador en ScoreSaber para desvincular su cuenta de Discord"))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), // mods or higher,
	async execute(script, interaction) {

		const discordUser = interaction.options.getUser("discord_user");
		const discordUserId = interaction.options.getString("discord_user_id");
		const scoreSaberId = interaction.options.getString("scoresaber_id");

		if(!discordUser && !discordUserId && !scoreSaberId) {
			interaction.reply("Debes suministrar el usuario de Discord, o el id del mismo, o el id de ScoreSaber del jugador!");
			return;
		}
		
		let ssPlayer: SSPlayer;

		if(discordUser || discordUserId) {
			ssPlayer = await script.scoreSaberAccountManager.unlinkScoreSaberAccountFromUser(false, null, discordUser?.id || discordUserId);
		} else {
			ssPlayer = await script.scoreSaberAccountManager.unlinkScoreSaberAccountFromUser(false, scoreSaberId);
		}

		if(ssPlayer) {
			interaction.reply(`La cuenta de ScoreSaber **${ssPlayer.name}** (ID ${ssPlayer.id}) se desvinculó correctamente del usario de Discord asociado!`)
		} else {
			interaction.reply(script.scoreSaberAccountManager.getErrorMsg()) // to-do: remove this error logic from services to throwables
		}

	},
} as DiscordCommand<BeatSaberScript>;
