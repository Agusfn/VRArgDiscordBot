import { Script } from "@core/Script";
import { DiscordClientWrapper } from "@core/DiscordClient";
import { createCanvas, loadImage } from "canvas";
import { AttachmentBuilder } from "discord.js";
import { getLeaderboard } from "@scripts/ranked-card-script/services/ApiFunctions";

export class MapGuessScript extends Script {

    private static instance: MapGuessScript;

    protected scriptTitle = "Map Guess Script";

    public partidaEnCurso = false;
    public palabraSecreta = '';
    public canalDeJuego = '';
    public temporizador: NodeJS.Timeout;
    public darCarta = false;
    private palabraOculta = '';

    constructor(public client: DiscordClientWrapper) {
        super(client);
        MapGuessScript.instance = this;
    }

    public static getInstance(): MapGuessScript {
        return MapGuessScript.instance;
    }

    public async iniciarPartida(message: any, channel: any, darCarta: boolean) {
        this.darCarta = darCarta;
        const scoresaberData = await getLeaderboard(13*Math.random());
        //const beatsaverData = await getBeatSaverInfo(scoresaberData.hash);
        this.palabraSecreta = scoresaberData.songName;
        this.palabraOculta = this.ocultarPalabra(this.palabraSecreta);
    
        this.partidaEnCurso = true;
        this.canalDeJuego = channel.id;
    
        this.temporizador = setTimeout(() => {
            if (this.partidaEnCurso) {
              channel.send('Se acabó el tiempo! Nadie adivinó el mapa ranked, era: **' + this.palabraSecreta + '**');
              this.partidaEnCurso = false;
              this.darCarta = false;
            }
        }, 1000*60);
    
        function delay(ms: number) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        for(var i = 0; i < 8; i++) {
            if(!this.partidaEnCurso) {
                i = 7;
            }
            const stackBlur = require('stackblur-canvas');
            const canvas = createCanvas(512, 512);
            const ctx = canvas.getContext('2d');
            const imagenCover = await loadImage(scoresaberData.coverImage);
            ctx.drawImage(imagenCover, 0, 0, canvas.width, canvas.height);
            stackBlur.canvasRGBA(canvas, 0, 0, canvas.width, canvas.height, 70-10*i);
            const coverImageAttachment = new AttachmentBuilder(canvas.toBuffer());
    
            await message.edit({ content: `Adivina el mapa ranked: \`${this.palabraOculta}\``, files: [coverImageAttachment] });
            await delay(5000);
        }
    }

    private ocultarPalabra(palabra: string) {
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

}