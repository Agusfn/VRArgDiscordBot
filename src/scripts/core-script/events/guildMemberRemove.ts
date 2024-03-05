import { DiscordEvent } from "@ts/interfaces";
import { Client, Events, GuildMember } from "discord.js";
import { CoreScript } from "../CoreScript";

export default {
	name: Events.GuildMemberRemove,
	execute(script, guildMember: GuildMember) {

		console.log(script.getName(), "guild member removed", guildMember)

	},
} as DiscordEvent<CoreScript, Events.GuildMemberRemove>;
