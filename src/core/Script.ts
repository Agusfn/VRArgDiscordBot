import { DiscordClient } from "./DiscordClient";

export abstract class Script {

    constructor(public client: DiscordClient) {

    }

    /**
     * The name of our script.
     */
    protected abstract scriptName: string;


    public getName() {
        return this.scriptName
    }
    
}