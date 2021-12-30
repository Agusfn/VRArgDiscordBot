import { Script } from "@lib/index"
import { Message } from "discord.js"
import { CommandManager } from "@lib/CommandManager"

export class TestScript extends Script {

    protected scriptName = "Test Script"

    protected onUserMessage: undefined
    public initDbModels: undefined

    public async onInitialized() {

        CommandManager.newCommand("testcommand", "<param1> <param2>", async (message: Message, args) => {

            message.reply({content: "hola"})

        }, "Descripcion del comando.", "913629201377165332")

        CommandManager.newCommand("testcommand2", null, async (message: Message, args) => {

            message.reply({content: "hola"})

        }, "Descripcion del comando.", "asdasd")



    }
    
}