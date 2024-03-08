import { DiscordClientWrapper } from "@core/DiscordClient";
import { Script } from "@core/Script";

export class RankedCardScript extends Script {

    constructor(public client: DiscordClientWrapper) {
        super(client);
    }

    protected scriptName = "Ranked Cards Script";


}