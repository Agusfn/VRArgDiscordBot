import { CommandManager } from "@lib/index";
import { Message } from "discord.js";
import { registerAdminCommands } from "./adminCommands"


export default () => {

    registerAdminCommands()

    CommandManager.newCommand("about", null, async (message: Message, args) => {
        message.reply(process.env.BOT_NAME + " Bot v `"+process.env.VERSION + "` \n- Bot Desarrollado por **Agusfn**. \n- Versus y Cumpleaños por **Andres**. \n- Cartas Ranked por **Elecast**.")
    }, "Acerca del bot.", "Otros")

}