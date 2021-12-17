import { CommandManager } from "@lib/index"
import { Message } from "discord.js"



export const registerAdminCommands = () => {

    CommandManager.newAdminCommand("admincommand", null, async (message: Message, args) => {

        message.reply({content: "hola"})

    }, "Descripcion del comando.")


    CommandManager.newAdminCommand("banearparasiempre", "<userName>", async (message: Message, args) => {

        message.reply({content: "hola"})

    }, "Descripcion del comando.")


}