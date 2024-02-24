import { Discord } from "@lib/Discord"
import { TextChannel } from "discord.js"
import { PlayerBirthday } from "../model/PlayerBirthday"

export class PlayerAnnouncements {

    private static outputChannel: TextChannel

    public static async initialize() {
        console.log("initializing BirthdayAnnouncements")
        this.outputChannel = await Discord.getTextChannel(process.env.CHANNEL_ID_BEATSABER_MILESTONES)
    }


    /**
     * 
     * @param player 
     * @param country Country code used in ScoreSaber API
     */
    public static async sendForPlayerBirthday(user: PlayerBirthday) {

        const message = `Feliz cumpleaños **${user.discordUserId}**!!!`;

        await this.outputChannel.send(message);
    }

    
}