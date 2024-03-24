import { DiscordEvent } from "@ts/interfaces";
import { Events } from "discord.js";
import { CoreScript } from "../CoreScript";

export default {
	name: Events.GuildMemberAdd, // when a member just joins the server
	async execute(script, guildMember) {

		await script.userManager.createUserOnMemberJoin(guildMember);

	},
} as DiscordEvent<CoreScript, Events.GuildMemberAdd>;
