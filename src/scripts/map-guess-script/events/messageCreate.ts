import { DiscordEvent } from "@ts/interfaces";
import { Events } from "discord.js";
import { MapGuessScript } from "../MapGuessScript";
import { commitTransaction, openFreeCard, startTransaction } from "@scripts/ranked-card-script/commands/cartas";

export default {
	name: Events.MessageCreate,
	async execute(script, message) {

		if (message.author.bot || !script.partidaEnCurso || message.channel.id !== script.canalDeJuego) return;

        if (message.content.toLowerCase() === script.palabraSecreta.toLowerCase()) {
            message.react('✅');
            message.channel.send(`¡Felicidades ${message.author}! Has adivinado el mapa ranked.`);
            clearTimeout(script.temporizador);
            script.partidaEnCurso = false;
            if(script.darCarta) {
                script.darCarta = false;
                message.channel.send(`¡Además te has ganado una carta!`);
                const transaction = await startTransaction();
                await openFreeCard([], message, transaction, 1);
                await commitTransaction(transaction);
            }
        } else {
            message.react('❌');
        }
		
	},
} as DiscordEvent<MapGuessScript, Events.MessageCreate>;
