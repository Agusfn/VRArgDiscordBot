import { Script } from "@core/Script";
import { DiscordClientWrapper } from "@core/DiscordClient";

export class VersusScript extends Script {

    protected scriptTitle = "Versus Script";
    
    constructor(public client: DiscordClientWrapper) {
        super(client);
    }

}