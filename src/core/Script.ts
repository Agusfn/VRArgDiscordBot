import { DiscordClientWrapper } from "./DiscordClient";

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