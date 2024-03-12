import { DiscordCommand } from "@ts/interfaces";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { BeatSaberScript } from "../BeatSaberScript";


export default {
	data: new SlashCommandBuilder()
		.setName('deslinkear_admin')
		.setDescription("Desvincular una cuenta de ScoreSaber de una cuenta de Discord.")
		.addUserOption(option => option
			.setName("discord_user")
			.setDescription("Usuario de discord a desvincular su cuenta de ScoreSaber"))
		.addStringOption(option => option
			.setName("discord_user_id")
			.setDescription("ID del usuario de discord a desvincular"))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), // mods or higher,
	async execute(script, interaction) {

		const discordUser = interaction.options.getUser("discord_user");
		const discordUserId = interaction.options.getString("discord_user_id");

		if(!discordUser && !discordUserId) {
			interaction.reply("Debes suministrar el usuario de Discord, o el id del mismo!");
		}

		const ssPlayer = await script.scoreSaberAccountManager.unlinkScoreSaberAccountFromUser(discordUser?.id || discordUserId, false)

		if(ssPlayer) {
			interaction.reply(`La cuenta de ScoreSaber **${ssPlayer.name}** (ID ${ssPlayer.id}) se desvinculó correctamente del usario de Discord ${discordUser?.username || discordUserId}!`)
		} else {
			interaction.reply(script.scoreSaberAccountManager.getErrorMsg())
		}

	},
} as DiscordCommand<BeatSaberScript>;
