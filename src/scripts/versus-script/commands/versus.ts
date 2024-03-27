import { DiscordCommand } from "@ts/interfaces";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from "discord.js";
import { VersusScript } from "../VersusScript";
import axios from "axios";
import { SSPlayer } from "@scripts/beat-saber-script/models";


export default {
	data: new SlashCommandBuilder()
		.setName('versus')
		.setDescription("Genera un versus entre dos jugadores de Beat Saber.")
		.addStringOption(option => option
			.setName("jugador1")
			.setDescription("@ del primer jugador")
			.setRequired(true))
		.addStringOption(option => option
			.setName("jugador2")
			.setDescription("@ del segundo jugador")
			.setRequired(true)),
	async execute(script, interaction) {
	
		try {
                
			await interaction.deferReply();

			// Obtener los ID de los jugadores

			const player1Id = interaction.options.getString("jugador1").replace(/[<@!>]/g, '')
			const player2Id = interaction.options.getString("jugador2").replace(/[<@!>]/g, '')

			const player1 = await SSPlayer.findOne({ where: { discordUserId: player1Id } }).then(res => res?.dataValues.id)
			const player2 = await SSPlayer.findOne({ where: { discordUserId: player2Id } }).then(res => res?.dataValues.id)

			if (!player1) {
				interaction.editReply(`No se encontró un jugador de Beat Saber vinculado a <@${player1Id}>, tiene que vincular su cuenta de Beat Saber con el comando /linkear`)
				return
			}
			if (!player2) {
				interaction.editReply(`No se encontró un jugador de Beat Saber vinculado a <@${player2Id}>, tiene que vincular su cuenta de Beat Saber con el comando /linkear`)
				return
			}

			// Hacer la llamada al servidor
			const response: any = await axios.get(`http://127.0.0.1:5000?user1=${player1}&user2=${player2}`).then(res => res.data)

			const bplistUrl = `http://127.0.0.1:5000${response['0-download']}`
			const imageUrl = `http://127.0.0.1:5000${response['1-rendered_pool']}`

			// Descargar el archivo .bplist
			const bplistResponse = await axios.get(bplistUrl).then(res => res.data)

			const buffer = Buffer.from(bplistResponse, 'utf-8');

			const html = await axios.get(imageUrl).then(res => res.data)


			const nodeHtmlToImage = require('node-html-to-image')
			const image = await nodeHtmlToImage({
							html: html,
							puppeteerArgs: {
											args: ['--no-sandbox']
							}
			})
			
			const button = new ButtonBuilder()
        .setLabel('Tira una moneda')
        .setStyle(ButtonStyle.Secondary)
				.setCustomId('coinflip')
				.setEmoji('🪙')

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

			// Enviar el archivo .bplist con la imagen, tambien generar un boton que ejecute un coinflip

			await interaction.followUp({files: [{attachment: buffer, name: `${response['3-filename']}.bplist`}, {attachment: image, name: `${response['3-filename']}.png`}]})
			await interaction.channel.send({components: [row] });

	} catch (error) {
		console.error(error)
		interaction.editReply("Ha ocurrido un error al intentar generar el versus.")
	}

	return
	},
} as DiscordCommand<VersusScript>;