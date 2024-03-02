import DiscordJS, { Guild, TextChannel, Message, GatewayIntentBits } from "discord.js"


export class DiscordManager {

    private client = new DiscordJS.Client({ intents: [] });

    public async initialize() {
        this.login();
        
        this.client.commands = {};
    }

    public async login() {
        
    }

    public registerNewCommand() {

    }

    public initListeners() {

    }
    

}