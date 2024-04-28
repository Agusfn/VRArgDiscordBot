import { DiscordEvent } from "@ts/interfaces";
import { Events } from "discord.js";
import { ArgptScript } from "../ArgptScript";

export default {
	name: Events.MessageCreate,
	async execute(script, message) {

		if (!script.enabled || message.author.bot || message.channel.id !== script.channel.id) return;

    script.history.push({ role: "user", content: "<" + message.author.displayName + ">: " + message.content });

    script.pendingResponse = true;

    // Cancelar cualquier timeout anterior para asegurar que no se envíen respuestas múltiples
    if (script.typingTimeout) {
      clearTimeout(script.typingTimeout);
    }

    // Establecer un nuevo timeout para enviar la respuesta
    script.typingTimeout = setTimeout(async () => {
        await script.sendResponse();
    }, 5000); // Esperar 5 segundos antes de enviar la respuesta
		
	},
} as DiscordEvent<ArgptScript, Events.MessageCreate>;
