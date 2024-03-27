import { DiscordCommand } from "@ts/interfaces";
import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import { MapGuessScript } from "../MapGuessScript";
import { getBeatSaverInfo, getLeaderboard } from "@scripts/ranked-card-script/services/ApiFunctions";
import { DiscordClientWrapper } from "@core/DiscordClient";
import { createCanvas, loadImage } from "canvas";

let partidaEnCurso = false;
let palabraSecreta = '';
let palabraOculta = '';
let canalDeJuego = '';
let temporizador: NodeJS.Timeout;

export default {
	data: new SlashCommandBuilder()
		.setName('adivinamapa')
		.setDescription('Comando para iniciar una partida de **Adivina El Mapa**'),
    async execute(script, interaction) {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;

        if (commandName === 'adivinamapa') {
            if(partidaEnCurso) {
                await interaction.reply("Ya hay una partida en curso, espera a que termine");
                return;
            }

            const message = await interaction.reply('Iniciando...');

            const scoresaberData = await getLeaderboard(13*Math.random());
            //const beatsaverData = await getBeatSaverInfo(scoresaberData.hash);
            palabraSecreta = scoresaberData.songName;
            palabraOculta = ocultarPalabra(palabraSecreta);
    
            partidaEnCurso = true;
            canalDeJuego = interaction.channel.id;

            temporizador = setTimeout(() => {
                if (partidaEnCurso) {
                  interaction.channel.send('Se acabó el tiempo! Nadie adivinó el mapa ranked, era: **' + palabraSecreta + '**');
                  partidaEnCurso = false;
                }
            }, 1000*60);

            function delay(ms: number) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            for(var i = 0; i < 8; i++) {
                if(!partidaEnCurso) {
                    i = 7;
                }
                const stackBlur = require('stackblur-canvas');
                const canvas = createCanvas(512, 512);
                const ctx = canvas.getContext('2d');
                const imagenCover = await loadImage(scoresaberData.coverImage);
                ctx.drawImage(imagenCover, 0, 0, canvas.width, canvas.height);
                stackBlur.canvasRGBA(canvas, 0, 0, canvas.width, canvas.height, 70-10*i);
                const coverImageAttachment = new AttachmentBuilder(canvas.toBuffer());

                await message.edit({ content: `Adivina el mapa ranked: \`${palabraOculta}\``, files: [coverImageAttachment] });
                await delay(5000);
            }
        }
    },
} as DiscordCommand<MapGuessScript>;

DiscordClientWrapper.getInstance().on('messageCreate', message => {
if (message.author.bot || !partidaEnCurso || message.channel.id !== canalDeJuego) return;

if (message.content.toLowerCase() === palabraSecreta.toLowerCase()) {
    message.react('✅');
    message.channel.send(`¡Felicidades ${message.author}! Has adivinado el mapa ranked.`);
    clearTimeout(temporizador);
    partidaEnCurso = false;
} else {
    message.react('❌');
}
});

function ocultarPalabra(palabra: string) {
    let first = false;
    palabra = palabra.replace(/ /g, '  ');
    return palabra
      .split('')
      .map((char, i) => {
        if (i === 0 || i === palabra.length - 1 || char === ' ') {
          return char;
        } else {
            if(!first) {
                first = true;
                return '_';
            }
            else {
                return ' _';
            }
        }
      })
      .join('');
  }