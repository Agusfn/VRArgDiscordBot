import { SSPlayer } from "../model/index"
import { ScoreSaberAPI } from "../utils/index"
import { Discord } from "@lib/Discord"
import { TextChannel } from "discord.js"
import { SSCountries } from "../config"

export class PlayerAnnouncements {

    private static outputChannel: TextChannel

    public static async initialize() {
        this.outputChannel = await Discord.getTextChannel(process.env.CHANNEL_ID_BEATSABER_MILESTONES)
    }


    /**
     * 
     * @param player 
     * @param country Country code used in ScoreSaber API
     */
    public static async sendForPlayerTop1Country(player: SSPlayer, country: string) {

        let countryName = "(pais)"
        if(country == SSCountries.ARGENTINA) {
            countryName = "Argentina"
        }

        this.outputChannel.send("@anuncios-players "+player.discordUserId+" alcanzó el Top #1 en " + countryName + "!") // to-do: add discord tagging user
    }


    // <each announcement of each case specified with needed params>

    // Player opponent or "face off" announcements

    public static async playerRankSurpassedOpponent(player: any, opponent: any) {

    }

    

    
}