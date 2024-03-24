import { DiscordCommand } from "@ts/interfaces";
import { SlashCommandBuilder } from "discord.js";
import { VersusScript } from "../VersusScript";


export default {
	data: new SlashCommandBuilder()
		.setName('coinflip')
    .setDescription("Tira una moneda."),
      async execute(script, interaction) {
        await sendCoinflip(interaction);
    }
} as DiscordCommand<VersusScript>;


export async function sendCoinflip(interaction: any) {
  await interaction.deferReply();
  const result = Math.random() >= 0.5 ? "cara" : "cruz";
  // send image from resources
  await interaction.editReply({ content: `Ha salido ${result}!`, files: [`resources/versus-script/${result}.png`] });


}