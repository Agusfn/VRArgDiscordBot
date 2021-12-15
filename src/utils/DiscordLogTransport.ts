import Transport from "winston-transport"
import { TextChannel } from "discord.js"


/**
 * Custom winston logging transport to send logs through discord channel, additionally to console log
 */
export default class DiscordLogTransport extends Transport {


    /**
     * Discord guild channel in which all logs will proceed to
     */
    private logChannel: TextChannel

    constructor(channel: TextChannel) {
        super()
        this.logChannel = channel
    }

    /**
     * Custom log function
     * @param info 
     * @param callback 
     */
    log(info: any, callback: any) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        if(process.env.DISCORD_CHANNEL_LOGGING == "true") { // to-do: replace by dynamic config
            this.logChannel.send(`[${info.timestamp}] ${info.level}: ${info.message}`)
        }
        
        callback();
    }
    
}