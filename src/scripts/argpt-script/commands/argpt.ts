import { DiscordCommand } from "@ts/interfaces";
import { GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
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
                .setName('voice')
                .setDescription('Entra al canal de voz')
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
        .addSubcommand(subcommand =>
            subcommand
                .setName('lang')
                .setDescription('Configurar el idioma de la voz')
                .addStringOption(option =>
                    option
                        .setName('lang_code')
                        .setDescription('codigo de idioma. ejemplo: es, en')
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
                script.loadPrompt();
                interaction.reply("Historial de ArGPT limpiado correctamente.");
            }
            else if (interaction.options.getSubcommand() === 'setup') {
                script.ip = interaction.options.getString('ip');
                script.port = interaction.options.getInteger('port');
                interaction.reply({ content: "Has configurado la IP y puerto correctamente!", ephemeral: true });
            }
            else if (interaction.options.getSubcommand() === 'voice') {
                script.voiceEnabled = !script.voiceEnabled;
                interaction.reply("ArGPT voice set to " + script.voiceEnabled);

                if(!script.voiceEnabled){
                    return;
                }

                if (!(interaction.member instanceof GuildMember)) {
                    interaction.reply({ content: "You must be in a voice channel to use this command.", ephemeral: true });
                    return;
                }

                script.voiceChannel = interaction.member.voice.channel;
            }
            else if (interaction.options.getSubcommand() === 'lang') {
                script.voiceLang = interaction.options.getString('lang_code');
                interaction.reply({ content: "Has configurado el idioma de la voz a " + script.voiceLang, ephemeral: true });
            }
        }
    },
} as DiscordCommand<ArgptScript>;