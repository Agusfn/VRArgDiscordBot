import { DiscordEvent } from "@ts/interfaces";
import { Client, Events } from "discord.js";
import { TestScript } from "../TestScript";

export default {
	name: Events.ClientReady,
	once: true,
	execute(script: TestScript, client: Client) {
		console.log(`Ready! Logged in as ${client.user.tag}. Script: ${script.getName()}`);
	},
} as DiscordEvent<TestScript, Events.ClientReady>;
