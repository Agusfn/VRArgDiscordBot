import { Events } from "discord.js";
import { ArgptScript } from "../ArgptScript";
import { DiscordEvent } from "@ts/interfaces";

export default {
    name: Events.TypingStart,
    async execute(script, typing) {
        if (!script.enabled || typing.user.bot || typing.channel.id !== script.channel.id) return;
        if(script.pendingResponse) {
            if (script.typingTimeout) {
                clearTimeout(script.typingTimeout);
            }

            // Establecer un nuevo timeout
            script.typingTimeout = setTimeout(async () => {
                await script.sendResponse();
            }, 5000); // Esperar 5 segundos antes de enviar la respuesta
        }
    },
} as DiscordEvent<ArgptScript, Events.TypingStart>;
