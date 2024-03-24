import { DiscordClientWrapper } from "./DiscordClient";

export interface Script {
    /** Called when the script is initialized and the discord client is ready. */
    onReady?(): Promise<void> | void;
    /** (optional) Very brief description of what this script does (in language of users). */
    description?: string;
}


export abstract class Script {

    constructor(public client: DiscordClientWrapper) {

    }

    /** The name or title of this script. The script commands are grouped under this title when using /commands. */
    protected abstract scriptTitle: string;

    public getTitle() {
        return this.scriptTitle
    }
    
}