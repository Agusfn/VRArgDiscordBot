import { CommandManager } from "@lib/index";
import { Message } from "discord.js";
import { registerAdminCommands } from "./adminCommands"


export default () => {

    registerAdminCommands()

    CommandManager.newCommand("about", null, async (message: Message, args) => {
        message.reply(process.env.BOT_NAME + " Bot v"+process.env.VERSION + ". Developed by <@455891068580528153> (^_^)")
    }, "Acerca del bot.", "Otros")

}