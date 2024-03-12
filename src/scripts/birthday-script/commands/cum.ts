import { DiscordCommand } from "@ts/interfaces";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { BirthdayScript } from "../birthdayScript";


export default {
	data: new SlashCommandBuilder()
		.setName('cum')
    .setDescription('Comandos para manejar tu cumpleaños.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('registrar')
        .setDescription('Registrar tu cumpleaños.')
        .addStringOption(option => option
          .setName("fecha")
          .setDescription("Fecha de tu cumpleaños en formato DD/MM/YYYY")
          .setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('desvincular')
        .setDescription('Desvincular tu cumpleaños.')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('ver')
        .setDescription('Ver tu cumpleaños.')
    ),
	async execute(script, interaction) {

    const subcommand = interaction.options.getSubcommand();

    // reply with the subcommand
    // interaction.reply(`Subcommand: ${subcommand}`);

    switch(subcommand) {
      case "registrar":
        const fecha = interaction.options.getString("fecha");
        const fechaSplit = fecha.split("/");
        const dia = parseInt(fechaSplit[0]);
        const mes = parseInt(fechaSplit[1]);
        const anio = parseInt(fechaSplit[2]);
        const fechaNacimiento = new Date(anio, mes - 1, dia);
        const birthday = await script.playerBirthdayManager.registerBirthday(interaction.user.id, fechaNacimiento);
        if(birthday) {
          interaction.reply(`Tu cumpleaños ha sido registrado correctamente!`);
        } else {
          interaction.reply("No se ha podido registrar tu cumpleaños. Inténtalo de nuevo más tarde.");
        }
        break;
      case "desvincular":
        const desvinculado = await script.playerBirthdayManager.unregisterBirthday(interaction.user.id);
        if(desvinculado) {
          interaction.reply(`Tu cumpleaños ha sido desvinculado correctamente!`);
        } else {
          interaction.reply("No se ha podido desvincular tu cumpleaños. Inténtalo de nuevo más tarde.");
        }
        break;
      case "ver":
        const userBirthday = await script.playerBirthdayManager.getBirthday(interaction.user.id);
        if(userBirthday) {
          interaction.reply(`Tu cumpleaños está registrado para el ${userBirthday.getDate()}/${userBirthday.getMonth() + 1}/${userBirthday.getFullYear()}`);
        } else {
          interaction.reply("No tienes tu cumpleaños registrado.");
        }
        break;
    }

	},
} as DiscordCommand<BirthdayScript>;
