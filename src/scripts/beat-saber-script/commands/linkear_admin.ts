import { DiscordCommand } from "@ts/interfaces";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { BeatSaberScript } from "../BeatSaberScript";
import { getScoreSaberIdFromIdOrURL } from "../utils/other";


export default {
	data: new SlashCommandBuilder()
		.setName('linkear_admin')
		.setDescription("Vincular una cuenta de ScoreSaber a una cuenta de Discord.")
		.addUserOption(option => option
			.setName("discord_user")
			.setDescription("Usuario a vincularle una cuenta de ScoreSaber")
			.setRequired(true))
		.addStringOption(option => option
			.setName("ss_id_url")
			.setDescription("URL o id de ScoreSaber")
			.setMaxLength(100)
			.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), // mods or higher,
	async execute(script, interaction) {
		
		const discordUser = interaction.options.getUser("discord_user");
		const ssIdUrl = interaction.options.getString("ss_id_url");

		const scoreSaberId = getScoreSaberIdFromIdOrURL(ssIdUrl);
		if(!scoreSaberId) {
			interaction.reply("Ingresa un ID de scoresaber o una URL de jugador de ScoreSaber válido.")
			return
		}

		const ssPlayer = await script.scoreSaberAccountManager.linkScoreSaberAccountToUser(discordUser.id, scoreSaberId, false)

		if(ssPlayer) {
			interaction.reply(`La cuenta de ScoreSaber **${ssPlayer.name}** se vinculó correctamente al usuario de Discord ${discordUser.username}!`)
		} else {
			interaction.reply(script.scoreSaberAccountManager.getErrorMsg())
		}

	},
} as DiscordCommand<BeatSaberScript>;
