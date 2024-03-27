import { Script } from "@core/Script";
import { DiscordClientWrapper } from "@core/DiscordClient";

export class MapGuessScript extends Script {

    protected scriptTitle = "Map Guess Script";

    constructor(public client: DiscordClientWrapper) {
        super(client);
    }

}