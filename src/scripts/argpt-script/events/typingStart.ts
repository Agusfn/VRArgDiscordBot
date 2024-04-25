import { Events } from "discord.js";
import { ArgptScript } from "../ArgptScript";
import { DiscordEvent } from "@ts/interfaces";

export default {
    name: Events.TypingStart,
    async execute(script, typing) {
        if (!script.enabled || typing.user.bot || typing.channel.id !== script.channel.id) return;

        const currentTime = Date.now();
        script.lastTypingTime = currentTime;

        if(script.pendingResponse) {
            function delay(ms: number) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            await delay(5000);
            if (currentTime === script.lastTypingTime) {
                await script.sendResponse();
            }
        }
    },
} as DiscordEvent<ArgptScript, Events.TypingStart>;
