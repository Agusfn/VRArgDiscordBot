import { DiscordEvent } from "@ts/interfaces";
import { Events } from "discord.js";
import { MapGuessScript } from "../MapGuessScript";

export default {
	name: Events.MessageCreate,
	async execute(script, message) {

		if (message.author.bot || !script.partidaEnCurso || message.channel.id !== script.canalDeJuego) return;

        if (message.content.toLowerCase() === script.palabraSecreta.toLowerCase()) {
            message.react('✅');
            message.channel.send(`¡Felicidades ${message.author}! Has adivinado el mapa ranked.`);
            clearTimeout(script.temporizador);
            script.partidaEnCurso = false;
        } else {
            message.react('❌');
        }
		
	},
} as DiscordEvent<MapGuessScript, Events.MessageCreate>;
