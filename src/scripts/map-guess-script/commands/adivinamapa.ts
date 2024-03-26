import { DiscordCommand } from "@ts/interfaces";
import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import { MapGuessScript } from "../MapGuessScript";
import { getBeatSaverInfo, getLeaderboard } from "@scripts/ranked-card-script/services/ApiFunctions";
import { DiscordClientWrapper } from "@core/DiscordClient";

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

            const coverImageAttachment = new AttachmentBuilder(scoresaberData.coverImage);
            await interaction.reply({ content: `Adivina el mapa ranked: \`${palabraOculta}\``, files: [coverImageAttachment] });

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