import { DiscordEvent } from "@ts/interfaces";
import { Events } from "discord.js";
import { ArgptScript } from "../ArgptScript";
import axios from 'axios';

export default {
	name: Events.MessageCreate,
	async execute(script, message) {

		if (!script.enabled || message.author.bot || message.channel.id !== script.channel.id) return;

    script.history.push({ role: "user", content: "<" + message.author.displayName + ">: " + message.content });

    script.pendingResponse = true;

    const currentTime = Date.now();
    script.lastTypingTime = currentTime;

    function delay(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    await delay(5000);
    if (currentTime === script.lastTypingTime) {
      await script.sendResponse();
    }
		
	},
} as DiscordEvent<ArgptScript, Events.MessageCreate>;
