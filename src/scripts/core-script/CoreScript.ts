import { DiscordClientWrapper } from "@core/DiscordClient";
import { Script } from "@core/Script";
import { DiscordCommand } from "@ts/interfaces";
import { UserManager } from "./services/UserManager";


export class CoreScript extends Script {

    public userManager = new UserManager();

    constructor(public client: DiscordClientWrapper) {
        super(client);
    }

    scriptTitle = "Comandos principales";


    
    public groupCommandsByScript() {

        const groupedCommands: { [groupName: string]: DiscordCommand<Script>[] } = {};

        for(const [commandName, command] of this.client.getCommands()) {

            const groupName = command.script!.getTitle();

            if(!groupedCommands[groupName]) {
                groupedCommands[groupName] = [command];
            } else {
                groupedCommands[groupName].push(command);
            }
		}

        return groupedCommands;
    }

}