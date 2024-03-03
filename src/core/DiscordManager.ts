import logger from "@utils/logger";
import { getCommandsFromFolder } from "@utils/commandFolders";
import DiscordJS, { Guild, TextChannel, Message, GatewayIntentBits, Collection, Events } from "discord.js"


export class DiscordManager {

    private client = new DiscordJS.Client({ 
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
    });

    private commands: Collection<any, any> = new Collection();

    constructor(private botToken: string, private guildId: string) {

    }

    public async initialize() {
        await this.login();
        this.initListeners();
    }

    public async login() {
        await this.client.login(this.botToken);
    }


    registerCommandsFromFolder(folderPath: string) {
        const commands = getCommandsFromFolder(folderPath);
        for(const command of commands) {
            this.registerNewCommand(command);
        }
    }

    /**
     * Register new commands for parsing on each command arrive.
     * Note: this does not upload the commands to Discord, this is for handling the commands in this application.
     * @param command 
     */
    public registerNewCommand(command: any) {
        this.commands.set(command.data.name, command);
    }

    public initListeners() {
        this.initCommandListener();
    }


    private initCommandListener() {

        this.client.on(Events.InteractionCreate, async interaction => {
            if(!interaction.isChatInputCommand()) return; // not slash command

            const command = this.commands.get(interaction.commandName);

            // Check we have this command registered
            if (!command) {
                logger.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                logger.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        });

    }
    


}