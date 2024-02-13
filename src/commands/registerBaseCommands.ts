import { CommandManager } from "@lib/index";
import { Message } from "discord.js";
import { registerAdminCommands } from "./adminCommands"


export default () => {

    registerAdminCommands()

    CommandManager.newCommand("about", null, async (message: Message, args) => {
        message.reply(process.env.BOT_NAME + " Bot v `"+process.env.VERSION + "` . Bot Developed by **Agusfn** | Pool Maker by **Andres**.")
    }, "Acerca del bot.", "Otros")

}