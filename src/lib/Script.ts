
export abstract class Script {

    /**
     * The name of our script.
     */
    protected abstract scriptName: string

    /**
     * Called when the bot is ready and the Script is initialized. May be used to register commands, crons, and other events. Shall only be called by ScriptLoader.
     */
    public async onInitialized?(): Promise<void>

    /**
     * When a user sends a message.
     */
    protected abstract onUserMessage?(): void

    /**
     * Function for initializing sequelize db models on script initialization.
     */
    public abstract initDbModels?(): void

    
    public  getName() {
        return this.scriptName
    }


}