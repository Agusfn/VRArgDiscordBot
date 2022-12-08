//import { Script } from "@lib/ScriptNew"
import { Message } from "discord.js"
import { CommandManager } from "@lib/CommandManager"
import { Container, Service } from 'typedi';
import { TestService2 } from "./services/TestService"
import { CommandDefinition, Script } from "@ts/interfaces";


@Service()
export class TestScript implements Script {

    public name = "Test Script New"

    public commands: CommandDefinition[] = [
        { cmd: "test", args: "<cantidad>", action: "hello", description: "Descripcion del comando." }
    ];

    protected onUserMessage: undefined
    public initDbModels: undefined

    constructor(private testServ: TestService2) {
        
    }

    // Lifecicle methods
    public async onInitialized() {
        
    }


    public async hello(message: Message, args: any[]) {
        message.reply({content: this.testServ.hello().toString() });
    }

    public a() {
        return this.testServ.hello();
    }

    
}