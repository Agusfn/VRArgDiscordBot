import { Player } from "@ts/interfaces"
import { User } from "../model/index"
import ScoreSaberApi from "@lib/ScoreSaberApi"
import { Discord } from "@lib/Discord"
import { TextChannel } from "discord.js"

export default class PlayerAnnouncements {

    private static outputChannel: TextChannel

    public static initialize() {
        this.outputChannel = Discord.getGuild().channels.cache.find(channel => channel.id == "<insert channel id>") as TextChannel
    }

    // Player milestone announcements

    public static async sendForPlayerTop1Country(player: any, country: any) {
        this.outputChannel.send("asd")
    }


    // <each announcement of each case specified with needed params>

    // Player opponent or "face off" announcements

    public static async playerRankSurpassedOpponent(player: any, opponent: any) {

    }

    

    
}