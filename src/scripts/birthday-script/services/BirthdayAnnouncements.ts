import { PlayerBirthday } from "../models/index"
import { TextChannel } from "discord.js"
import { UserManager } from "@scripts/core-script/services/UserManager"

/**
 * Class that handles the announcement of player milestones on a specific discord channel
 */
export class BirthdayAnnouncements {

    private outputChannel: TextChannel;

    constructor() {

    }

    public setOutputChannel(outputChannel: TextChannel) {
        this.outputChannel = outputChannel;
    }

    /**
     * 
     * @param player 
     * @param country Country code used in ScoreSaber API
     */
    public async announceBirthday(player: PlayerBirthday) {
        const user = await UserManager.getUserByDiscordId(player.discordUserId)

        this.outputChannel.send(`Feliz cum <@${user.discordUserId}>! 🎉🎉🎉`)
    }

    
}