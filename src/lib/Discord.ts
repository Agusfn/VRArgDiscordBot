import DiscordJS, { Guild, TextChannel, Message, GatewayIntentBits } from "discord.js"
import logger from "@utils/logger"
import { separateMultiLineString } from "@utils/index"

/**
 * hard limit by discord API
 */
const DISCORD_MSG_FETCH_LIMIT = 100


/**
 * Helper class to access Discord js client resources.
 */
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
     * @param guildId the guild (server) id
     */
    public static initialize(botToken: string, guildId: string) {
        
        // Create client instance
        this.clientInstance = new DiscordJS.Client({ 
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
        })

        // Log into client (async)
        this.clientInstance.login(botToken)

        this.guildId = guildId
    }


    /**
     * This must be called just after the client is logged in and ready. 
     */
    public static async loadGuild() {
        this.guild = await this.clientInstance.guilds.fetch(this.guildId)
    }


    /**
     * Get instance of client
     */
    public static getInstance() {
        return this.clientInstance
    }


    /**
     * Get our Guild (Discord server) object. May only be called after clientReady() was called.
     * @returns 
     */
    public static getGuild() {
        return this.guild
    }


    /**
     * Get a specific text channel of our guild. May only be called after client is ready and after calling loadGuild()
     * @param channelId 
     * @param fromCache default TRUE
     * @returns 
     */
    public static async getTextChannel(channelId: string, fromCache = true): Promise<TextChannel> {

        const channel = fromCache ? this.guild.channels.cache.find(channel => channel.id == channelId) :
            await this.guild.channels.fetch(channelId)

        if(channel.isTextBased()) return <TextChannel>channel
        else return null
    }


    /**
     * 
     * @param channelId 
     * @param amount 
     */
    public static async fetchMultipleMsgsFromChannel(channelId: string, amount: number): Promise<Message[]> {
        
        const channel = await this.getTextChannel(channelId)
        if(!channel) throw new Error("Channel id "+channelId+" was not found.")

        const pages = Math.ceil(amount / DISCORD_MSG_FETCH_LIMIT) // tentative amount of pages to be fetched. final number may be less because loop will stop upon first empty page
        const messages: Message[] = []
        let oldestMessage: string
        let msgsSaved = 0

        for(let i=0; i<pages; i++) {

            if(msgsSaved >= amount) break

            const fetchedMessages = await channel.messages.fetch({
                limit: DISCORD_MSG_FETCH_LIMIT,
                before: oldestMessage ? oldestMessage : null
            })

            if(fetchedMessages.size == 0) break

            const sortedMessages = fetchedMessages.sort((a, b) => a.createdAt > b.createdAt ? -1 : 1) // sort chunk from newest to oldest
            
            oldestMessage = sortedMessages.last().id
            
            sortedMessages.forEach(message => {
                if(msgsSaved >= amount) return
                messages.unshift(message) // add from newest to oldest to the beginning of resulting list, so it goes back to oldest->newest
                msgsSaved++
            })
        }

        return messages

    }



    public static async sendLongMessageToChannel(channel: TextChannel, messageContent: string) {
        
        const messagesContents = separateMultiLineString(messageContent, 1900) // message content limit is 2000

        for(const messageContent of messagesContents) {
            await channel.send(messageContent)
        }
    }






}