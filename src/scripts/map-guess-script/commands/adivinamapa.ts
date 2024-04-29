import { DiscordCommand } from "@ts/interfaces";
import { SlashCommandBuilder } from "discord.js";
import { MapGuessScript } from "../MapGuessScript";


export default {
	data: new SlashCommandBuilder()
		.setName('adivinamapa')
		.setDescription('Comando para iniciar una partida de **Adivina El Mapa**'),
    async execute(script, interaction) {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;

        if (commandName === 'adivinamapa') {
            if(script.partidaEnCurso) {
                await interaction.reply("Ya hay una partida en curso, espera a que termine");
                return;
            }
            const message = await interaction.reply('Iniciando...');
            await script.iniciarPartida(message, interaction.channel, false);
            
        }
    },
} as DiscordCommand<MapGuessScript>;