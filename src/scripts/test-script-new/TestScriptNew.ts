import { Script } from "@lib/index"
import { Message } from "discord.js"
import { CommandManager } from "@lib/CommandManager"
import { Container, Service } from 'typedi';
import { TestService2 } from "./services/TestService"

export class TestScriptNew extends Script {

    protected scriptName = "Test Script"

    protected onUserMessage: undefined
    public initDbModels: undefined

    // Lifecicle commands
    public async onInitialized() {
    }
    
}