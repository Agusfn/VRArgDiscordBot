import { DiscordCommand } from "@ts/interfaces";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { BeatSaberScript } from "../BeatSaberScript";
import { SSPlayer } from "../models";
import { User } from "@scripts/core-script/models/User";


export default {
	data: new SlashCommandBuilder()
		.setName('user_de_ss')
		.setDescription('Mostrar la cuenta de Discord vinculada a una cuenta de ScoreSaber.')
		.addStringOption(option => option
			.setName("scoresaber_id")
			.setDescription("Id de score saber")
			.setMaxLength(100)
			.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), // mods or higher,
	async execute(script, interaction) {
		
		const scoreSaberId = interaction.options.getString("scoresaber_id");
		const player = await SSPlayer.findOne({ include: User, where: { id: scoreSaberId } })

		if(!player) {
			interaction.reply("No se encontró el jugador de ScoreSaber registrado en el server con el id ingresado!")
			return
		}
		if(!player.User) {
			interaction.reply("La cuenta de ScoreSaber está registrada pero no se encontró el usuario de Discord (revisar, raro).")
			return
		}

		interaction.reply(`Usuario en Discord vinculado a la cuenta ScoreSaber _${player.name}_: **${player.User.username}** (discord id ${player.User.discordUserId})`)

	},
} as DiscordCommand<BeatSaberScript>;
