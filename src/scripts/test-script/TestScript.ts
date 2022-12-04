import { Script } from "@lib/index"
import { Message } from "discord.js"
import { CommandManager } from "@lib/CommandManager"
import { Container, Service } from 'typedi';
import { TestService2 } from "./services/TestService"

export class TestScript extends Script {

    protected scriptName = "Test Script"

    protected onUserMessage: undefined
    public initDbModels: undefined

    public async onInitialized() {

        const serv2 = Container.get(TestService2);
        serv2.hello();

        CommandManager.newCommand("testcommand", "<param1> <param2>", async (message: Message, args) => {
            
            message.reply({content: "hola"})

        }, "Descripcion del comando.", null, "913629201377165332")

        CommandManager.newCommand("testcommand2", null, async (message: Message, args) => {

            message.reply({content: "hola"})

        }, "Descripcion del comando.", null, "asdasd")



    }
    
}