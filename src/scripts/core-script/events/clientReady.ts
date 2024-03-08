import { DiscordEvent } from "@ts/interfaces";
import { Events } from "discord.js";
import { CoreScript } from "../CoreScript";

export default {
	name: Events.ClientReady,
	async execute(script, client) {

		// Sync our Users in database according to the current guild member list (creates new Users, mark users that have left)
		const members = await script.client.getGuild().members.fetch();
		await script.userManager.syncGuildMembers(members);

	},
} as DiscordEvent<CoreScript, Events.ClientReady>;
