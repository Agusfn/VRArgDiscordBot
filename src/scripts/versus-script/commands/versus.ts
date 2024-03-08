import { DiscordCommand } from "@ts/interfaces";
import { SlashCommandBuilder } from "discord.js";
import { VersusScript } from "../VersusScript";
import axios from "axios";
import html2canvas from "html2canvas";


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

			// convert html text to a DOM element
			const jsdom = require("jsdom");
			const dom = new jsdom.JSDOM(html);

			// Convertir HTML a imagen usando html2canvas
			const canvas = await html2canvas(dom.window.document.body, {
				allowTaint: true,
				useCORS: true,
				scale: 2
			});
			// Obtener la URL de la imagen generada
			const imageBlob = await new Promise((resolve) => {
					canvas.toBlob(resolve, "image/png"); // Puedes cambiar el formato a "image/jpeg" si lo prefieres
			});
			
			// Enviar el archivo .bplist y la imagen generada
			await interaction.reply({
				files: [
					{
						attachment: buffer,
						name: 'versus.bplist' 
					},
					{
						attachment: imageBlob,
						name: 'versus.png'
					}
				]
			});

	} catch (error) {
		console.error(error)
		interaction.reply("Ocurrió un error al generar el versus.")
	}

	return
	},
} as DiscordCommand<VersusScript>;