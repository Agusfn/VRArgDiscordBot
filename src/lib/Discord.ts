import DiscordJS, { Guild, TextChannel } from "discord.js"
import logger from "@utils/logger"


export class Discord {

    /**
     * The instance.
     */
    private static clientInstance: DiscordJS.Client

    /**
     * Our guild (server)
     */
    private static guild: Guild

    /**
     * Our guild (server) id
     */
    private static guildId: string

    
    /**
     * Initialize discord instance and log the client in.
     * @param botToken 
     */
    public static async initialize(botToken: string, guildId: string) {
        
        // Create client instance
        this.clientInstance = new DiscordJS.Client({ ws: {
            intents: ["GUILD_MEMBERS"]
        }})

        // Log into client (async)
        await this.clientInstance.login(botToken)

        this.guildId = guildId
    }


    /**
     * This must be called just after the client is logged in and ready. 
     */
    public static async loadGuild() {
        this.guild = await this.clientInstance.guilds.fetch(this.guildId)
        logger.info("Discord Client Logged In and initialized!")
    }


    /**
     * Get instance of client
     */
    public static getInstance() {
        return this.clientInstance
    }


    /**
     * Get our guild. May only be called after clientReady() was called.
     * @returns 
     */
    public static getGuild() {
        return this.guild
    }


    /**
     * Get a specific text channel of our guild. May only be called after client is ready.
     * @param channelId 
     * @returns 
     */
    public static async getTextChannel(channelId: string) {
        return <TextChannel>await this.clientInstance.channels.fetch(channelId)
    }



}