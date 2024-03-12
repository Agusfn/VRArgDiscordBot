import { DiscordCommand } from "@ts/interfaces";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { BeatSaberScript } from "../BeatSaberScript";
import { SSPlayer } from "../models";


export default {
	data: new SlashCommandBuilder()
		.setName('ss_de_user')
		.setDescription("Mostrar la cuenta de ScoreSaber vinculada a un User de Discord.")
		.addUserOption(option => option
			.setName("usuario")
			.setDescription("Usuario a mostrar la cuenta de scoresaber")
			.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), // mods or higher,
	async execute(script, interaction) {
		
		const discordUser = interaction.options.getUser("usuario");

		// Not really necessary:

		// const user = await User.findByPk(discordUser.id);
		// if(!user) {
		// 	interaction.reply("No se encontró un usuario de Discord en el server con ese id!")
		// 	return
		// }

		const player = await SSPlayer.findOne({ where: { discordUserId: discordUser.id } })
		if(!player) {
			interaction.reply(`El usuario ${discordUser.username} no tiene su cuenta de ScoreSaber vinculada!`)
			return
		}

		interaction.reply(`Cuenta de ScoreSaber de __${discordUser.username}__: <${player.scoreSaberURL()}> (**${player.name}**)`)

	},
} as DiscordCommand<BeatSaberScript>;
