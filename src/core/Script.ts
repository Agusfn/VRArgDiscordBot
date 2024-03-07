import { DiscordClientWrapper } from "./DiscordClient";

export interface Script {
    /** Called when the script is initialized and the discord client is ready. */
    onReady?(): Promise<void> | void;
}


export abstract class Script {

    constructor(public client: DiscordClientWrapper) {

    }

    /**
     * The name of our script.
     */
    protected abstract scriptName: string;

    public getName() {
        return this.scriptName
    }
    
}