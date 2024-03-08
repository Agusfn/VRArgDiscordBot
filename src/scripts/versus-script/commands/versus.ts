import { DiscordCommand } from "@ts/interfaces";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { VersusScript } from "../VersusScript";
import axios from "axios";


export default {
	data: new SlashCommandBuilder()
		.setName('versus')
		.setDescription("Genera un versus entre dos jugadores de Beat Saber.")
		.addStringOption(option => option
			.setName("player1")
			.setDescription("Enlace o ID de ScoreSaber del primer jugador")
			.setRequired(true))
		.addStringOption(option => option
			.setName("player2")
			.setDescription("Enlace o ID de ScoreSaber del segundo jugador")
			.setRequired(true)),
	async execute(script, interaction) {
	
		try {
                
			// Hacer la llamada al servidor
			const response: any = await axios.get(`http://127.0.0.1:5000?user1=${interaction.options.getString("player1")}&user2=${interaction.options.getString("player2")}`).then(res => res.data)

			const bplistUrl = `http://127.0.0.1:5000${response['0-download']}`
			const imageUrl = `http://127.0.0.1:5000${response['1-rendered_pool']}`

			// Descargar el archivo .bplist
			const bplistResponse = await axios.get(bplistUrl).then(res => res.data)

			const buffer = Buffer.from(bplistResponse, 'utf-8');

			const html = await axios.get(imageUrl).then(res => res.data)

			// convert html to image
			const image = await script.htmlToImage(html)
			
			// Enviar el archivo .bplist como respuesta al usuario
			await interaction.reply({
				files: [{
					attachment: buffer,
					name: 'versus.bplist'
				}]
			});



	} catch (error) {
		console.error(error)
		interaction.reply("Ocurrió un error al generar el versus.")
	}

	return
	},
} as DiscordCommand<VersusScript>;