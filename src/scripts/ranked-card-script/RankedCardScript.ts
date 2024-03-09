import { Script } from "@core/Script";
import { DiscordClientWrapper } from "@core/DiscordClient";

export class RankedCardScript extends Script {

    protected scriptName = "Ranked Card Script";

    constructor(public client: DiscordClientWrapper) {
        super(client);
    }

}