import { RegisteredCommand } from "@ts/interfaces"
import discordClient from "@utils/discordClient"


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
    protected abstract registerEvents?(): void

    /**
     * When a user sends a message.
     */
    protected abstract onUserMessage?(): void



    private commands: RegisteredCommand[] = []
    

    /**
     * Register new command
     * @param commandName 
     */
    protected onCommand(commandName: string, commandAction: (...args: any) => any ) {
        this.commands.push({
            name: commandName, 
            action: commandAction
        })
    }

    /**
     * Initialize script. Should only be called by ScriptLoader.
     */
    public initialize() {

        console.log("Initializing "+this.scriptName+"!")

        // Register discord ready event (if needed)
        if(typeof this.onInit == "function") {
            discordClient.on("ready", this.onInit);
        }

        // Register discord onMessage event (if needed)
        if(this.commands.length > 0) {
            const commands = this.commands
            discordClient.on("message", function(message) {
                // if message is command
                    // if command is included in command list
            });
        }

    }


}