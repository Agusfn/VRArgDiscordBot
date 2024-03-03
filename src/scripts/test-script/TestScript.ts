import { DiscordClient } from "@core/DiscordClient";
import { Script } from "../../core/Script";

export class TestScript extends Script {

    constructor(client: DiscordClient) {
        super(client);
    }

    protected scriptName: string = "Test Script";

}