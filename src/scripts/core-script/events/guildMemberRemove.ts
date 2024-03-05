import { DiscordEvent } from "@ts/interfaces";
import { Events, GuildMember } from "discord.js";
import { CoreScript } from "../CoreScript";

export default {
	name: Events.GuildMemberRemove,
	async execute(script, guildMember: GuildMember) {

		await script.userManager.markAbsentUserOnMemberLeft(guildMember);

	},
} as DiscordEvent<CoreScript, Events.GuildMemberRemove>;
