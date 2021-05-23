import { RegisteredCommand, CommandActionFunction, CommandMetadata } from "@ts/interfaces"
import discordClient from "@utils/discordClient"
import bot = require("bot-commander")
import { COMMAND_PREFIX } from "@utils/configuration"



export default abstract class Script {

    /**
     * The name of our script.
     */
    protected abstract scriptName: string

    /**
     * When the bot is ready to start working.
     */
    protected abstract onInit?(): void

    /**
     * Register commands, crons, and other events.
     */
    protected abstract registerCommands?(): void

    /**
     * When a user sends a message.
     */
    protected abstract onUserMessage?(): void



    private commands: RegisteredCommand[] = []
    

    /**
     * Register new command
     * @param commandName 
     */
    protected onCommand(commandName: string, args: string, commandAction: CommandActionFunction, description?: string) {
        
        // Add this command to the registered command array
        this.commands.push({
            name: commandName, 
            action: commandAction
        })

        // Add the callback action for when this command is interpreted
        const cmdName = commandName + (args ? " " + args : "")
        const command = bot.command(cmdName, null)
        if(description) {
            command.description(description)
        }
        command.showHelpOnEmpty()
        .action( (metadata: CommandMetadata, ...params: any) => {
            commandAction(metadata.message, params)
        })
    }

    /**
     * Initialize script. Should only be called by ScriptLoader.
     */
    public initialize() {
        
        console.log("Initializing "+this.scriptName+"!")

        // Load registered commands (if defined)
        if(typeof this.registerCommands == "function") {
            this.registerCommands()
        }

        // Register discord ready event (if needed)
        if(typeof this.onInit == "function") {
            discordClient.on("ready", this.onInit);
        }

        // Register discord onMessage event (if needed)
        if(this.commands.length > 0) {
            
            discordClient.on("message", function(message) {
                const msgText = message.content
                console.log(msgText)
                if(msgText.startsWith(COMMAND_PREFIX)) {
                    // Include Discord Message object into the bot-commander command metadata so we can have it in the handler.
                    const metadata: CommandMetadata = { 
                        message: message 
                    }
                    bot.parse(msgText, metadata)
                }
            });

        }

    }


}