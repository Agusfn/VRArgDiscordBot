import { DiscordCommand } from "@ts/interfaces";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
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
                .setName('clear')
                .setDescription('Limpia el historial')
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
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(script, interaction) {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;

        if (commandName === 'argpt') {
            if (interaction.options.getSubcommand() === 'enable') {
                script.enabled = true;
                interaction.reply("ArGPT ha sido activado.");
                script.channel = interaction.channel;
            }
            else if (interaction.options.getSubcommand() === 'disable') {
                script.enabled = false;
                interaction.reply("ArGPT ha sido desactivado.");
            }
            else if (interaction.options.getSubcommand() === 'clear') {
                script.history.splice(0, script.history.length);
                interaction.reply("Historial de ArGPT limpiado correctamente.");
            }
            else if (interaction.options.getSubcommand() === 'setup') {
                script.ip = interaction.options.getString('ip');
                script.port = interaction.options.getInteger('port');
                interaction.reply("Has configurado la IP y puerto correctamente!");
            }
        }
    },
} as DiscordCommand<ArgptScript>;