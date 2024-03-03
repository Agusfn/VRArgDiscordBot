import { DiscordCommand } from "@ts/interfaces";
import { SlashCommandBuilder } from "discord.js";
import { TestScript } from "../TestScript";


export default {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(script: TestScript, interaction) {
		
		await interaction.reply(`Pong from ${script.getName()}!`);
		
	},
} as DiscordCommand<TestScript>;
