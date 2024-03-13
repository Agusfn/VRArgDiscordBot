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
          .setName("dia")
          .setDescription("Día de tu cumpleaños.")
          .setRequired(true)
          .setMinLength(2)
          .setMaxLength(2)
    )
    .addStringOption(option => option
      .setName("mes")
      .setDescription("Mes de tu cumpleaños.")
      .setRequired(true)
      .setMinLength(2)
      .setMaxLength(2)
    )
    .addStringOption(option => option
      .setName("año")
      .setDescription("Año de tu cumpleaños.")
      .setRequired(true)
      .setMinLength(4)
      .setMaxLength(4)
    )
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
    
    switch(subcommand) {
      case "registrar":
        const dia = parseInt(interaction.options.getString("dia"));
        const mes = parseInt(interaction.options.getString("mes"));
        const anio = parseInt(interaction.options.getString("año"));

        const fechaNacimiento = new Date(anio, mes - 1, dia);
        const birthday = await script.playerBirthdayManager.registerBirthday(interaction.user.id, fechaNacimiento);
        if(birthday) {
          interaction.reply(`Tu cumpleaños ha sido registrado correctamente!`);
        } else {
          interaction.reply(script.playerBirthdayManager.getErrorMsg());
        }
        break;
      case "desvincular":
        const desvinculado = await script.playerBirthdayManager.unregisterBirthday(interaction.user.id);
        if(desvinculado) {
          interaction.reply(`Tu cumpleaños ha sido desvinculado correctamente!`);
        } else {
          interaction.reply(script.playerBirthdayManager.getErrorMsg());
        }
        break;
      case "ver":
        const userBirthday = await script.playerBirthdayManager.getBirthday(interaction.user.id);
        if(userBirthday) {
          interaction.reply(`Tu cumpleaños está registrado para el ${userBirthday.getDate()}/${userBirthday.getMonth() + 1}/${userBirthday.getFullYear()}`);
        } else {
          interaction.reply(script.playerBirthdayManager.getErrorMsg());
        }
        break;
    }

	},
} as DiscordCommand<BirthdayScript>;
