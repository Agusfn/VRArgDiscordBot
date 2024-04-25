import { DiscordCommand } from "@ts/interfaces";
import { SlashCommandBuilder } from "discord.js";
import { ArgptScript } from "../ArgptScript";

export default {
	data: new SlashCommandBuilder()
		.setName('argpt')
		.setDescription('Comandos para administrar **ArGPT**')
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Activa ArGPT')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Desactiva ArGPT')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Configurar la ip y puerto al que se conectara argpt')
                .addStringOption(option =>
                    option
                        .setName('ip')
                        .setDescription('IP')
                        .setRequired(true)
                    )
                .addIntegerOption(option =>
                    option
                        .setName('port')
                        .setDescription('Puerto')
                        .setRequired(true)
                )
        ),
    async execute(script, interaction) {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;

        if (commandName === 'argpt') {
            if (interaction.options.getSubcommand() === 'enable') {
                script.enabled = true;
                interaction.reply("ArGPT ha sido activado.");
            }
            else if (interaction.options.getSubcommand() === 'disable') {
                script.enabled = false;
                interaction.reply("ArGPT ha sido desactivado.");
            }
            else if (interaction.options.getSubcommand() === 'setup') {
                script.ip = interaction.options.getString('ip');
                script.port = interaction.options.getInteger('port');
                interaction.reply("Has configurado la IP y puerto correctamente!");
            }
        }
    },
} as DiscordCommand<ArgptScript>;