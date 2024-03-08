import { DiscordEvent } from "@ts/interfaces";
import { Client, Events, GuildMember } from "discord.js";
import { CoreScript } from "../CoreScript";

export default {
	name: Events.MessageCreate,
	execute(script, message) {

		console.log("created message: ", message.content)

	},
} as DiscordEvent<CoreScript, Events.MessageCreate>;
