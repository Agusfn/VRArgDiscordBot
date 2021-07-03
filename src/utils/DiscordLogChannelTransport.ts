import { LOGGING_DISCORD_CHANNEL_ID } from "@utils/configuration"
import discordClient from "./discordClient";
import Transport from "winston-transport"
import { TextChannel } from "discord.js"


/**
 * Custom winston logging transport to send logs through discord channel.
 */
export default class DiscordLogChannelTransport extends Transport {

    log(info: any, callback: any) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        // Send discord message in logging channel (if discord client is ready)
        if(discordClient.readyAt != null) {
            const logChannel = <TextChannel>discordClient.channels.cache.find(channel => channel.id == LOGGING_DISCORD_CHANNEL_ID)
            logChannel.send(`[${info.timestamp}] ${info.level}: ${info.message}`)
        }

        callback();
    }
    
}