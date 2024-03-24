import logger from "@utils/logger";
import { getCommandsFromFolder } from "@utils/commandFolders";
import DiscordJS, { Guild, TextChannel, Message, GatewayIntentBits, Collection, Events, ClientEvents } from "discord.js"
import { Script } from "./Script";
import { DiscordCommand, DiscordEvent } from "@ts/interfaces";
import { errorToString } from "@utils/strings";

/**
 * A discord client wrapper, made to work around a single Discord Guild
 */
export class DiscordClientWrapper {

    /** Instance reference for special access needs from outside app scope. */
    private static instance: DiscordJS.Client | null;

    public static getInstance() {
        return this.instance;
    }

    //
    
    /**
     * The discord client itself.
     */
    private client: DiscordJS.Client;

    /**
     * The guild where this Discord Client works around.
     */
    private guild: DiscordJS.Guild;

    /**
     * Local map with all existing registered commands. Registered commands are checked upon a new command calling arriving from Discord server, and if it exists, executed.
     */
    private commands: Collection<string, DiscordCommand<Script>> = new Collection();


    constructor(private botToken: string, private guildId: string) {

        this.client = new DiscordJS.Client({ 
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
        });

        DiscordClientWrapper.instance = this.client;

    }


    /**
     * Get the Discord Client itself
     * @returns 
     */
    public getClient() {
        return this.client;
    }

    public getCommands() {
        return this.commands;
    }

    /**
     * Get the guild on which this Discord client works
     * @returns 
     */
    public getGuild() {
        return this.guild;
    }

    public async login() {
        // Login
        await this.client.login(this.botToken);

        // Fetch guild object and save
        this.guild = await this.client.guilds.fetch(this.guildId);
        
        logger.info("Logged into Discord.")
    }

    /**
     * Register new commands for parsing on each command arrive, for a specific Script.
     * Note: this does not upload the commands to Discord, this is for handling the commands in this application.
     * @param command 
     * @param script The reference script from where this command is being called, to add context on the callback.
     */
    public registerNewCommand(command: DiscordCommand<Script>, script: Script) {
        command.script = script; // inject script reference into command
        this.commands.set(command.data.name, command);
    }


    /**
     * Create a new event listener for a specific Discord Event (on a specific Script context). Internally creates a websocket connection for said events.
     * @param event 
     * @param script The reference script from where this command is being called, to add context on the callback.
     */
    public registerNewEvent(event: DiscordEvent<Script, keyof ClientEvents>, script: Script) {
        // Register the event listener for this new event, and inject script as 1st argument
        if (event.once) {
            this.client.once(event.name, (...args) => event.execute(script, ...args));
        } else {
            this.client.on(event.name, (...args) => event.execute(script, ...args));
        }
    }

    public setCommandListener() {

        this.client.on(Events.InteractionCreate, async interaction => {
            if(!interaction.isChatInputCommand()) return; // not slash command

            const command = this.commands.get(interaction.commandName);

            // Check we have this command registered
            if (!command) {
                logger.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(command.script, interaction);
            } catch (error: any) {
                logger.error(`Error while excecuting command /${command.data.name}: ` + errorToString(error));
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'Ocurrió un error ejecutando este comando!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Ocurrió un error ejecutando este comando!', ephemeral: true });
                }
            }
        });

    }
    
    /**
     * Obtain a channel from the main Guild from cache.
     * @param channelId 
     * @returns 
     */
    public getChannel(channelId: string) {
        return this.guild.channels.cache.find(channel => channel.id == channelId);
    }


    public onReady(func: () => any) {
        this.client.once(Events.ClientReady, () => {
            func();
        })
    }


}