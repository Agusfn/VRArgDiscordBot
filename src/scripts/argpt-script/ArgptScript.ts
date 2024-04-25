import { Script } from "@core/Script";
import { DiscordClientWrapper } from "@core/DiscordClient";

export class ArgptScript extends Script {

    protected scriptTitle = "Argpt Script";

    public enabled: boolean = false;
    public ip: string = "";
    public port: number = 0;

    constructor(public client: DiscordClientWrapper) {
        super(client);
    }

}