import { DiscordEvent } from "@ts/interfaces";
import { Client, Events, GuildMember } from "discord.js";
import { CoreScript } from "../CoreScript";

export default {
	name: Events.GuildMemberAdd,
	execute(script, guildMember: GuildMember) {

		console.log(script.getName(), "guild member added", guildMember)

	},
} as DiscordEvent<CoreScript>;
