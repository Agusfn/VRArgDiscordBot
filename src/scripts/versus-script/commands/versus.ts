import { DiscordCommand } from "@ts/interfaces";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from "discord.js";
import { VersusScript } from "../VersusScript";
import axios from "axios";


export default {
	data: new SlashCommandBuilder()
		.setName('versus')
		.setDescription("Genera un versus entre dos jugadores de Beat Saber.")
		.addStringOption(option => option
			.setName("jugador1")
			.setDescription("Enlace o ID de ScoreSaber del primer jugador")
			.setRequired(true))
		.addStringOption(option => option
			.setName("jugador2")
			.setDescription("Enlace o ID de ScoreSaber del segundo jugador")
			.setRequired(true)),
	async execute(script, interaction) {
	
		try {
                
			await interaction.deferReply();

			// Obtener los id de los jugadores
			let player1 = userLinkToId(interaction.options.getString("jugador1"))
			let player2 = userLinkToId(interaction.options.getString("jugador2"))



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

function userLinkToId(user: string) {
	const splitedUser = user.split("/")

	if (splitedUser.length > 1) {
		return splitedUser[splitedUser.length - 1]
	} else {
		return user
	}
}