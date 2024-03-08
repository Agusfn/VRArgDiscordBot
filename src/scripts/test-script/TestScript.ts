import { DiscordClientWrapper } from "@core/DiscordClient";
import { Script } from "../../core/Script";

export class TestScript extends Script {

    constructor(client: DiscordClientWrapper) {
        super(client);
    }

    protected scriptName: string = "Test Script";

}