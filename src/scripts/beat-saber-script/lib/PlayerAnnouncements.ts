import { SSPlayer, PlayerScore } from "../model/index"
import { ScoreSaberAPI } from "../utils/index"
import { Discord } from "@lib/Discord"
import { TextChannel } from "discord.js"
import { SSCountries } from "../config"
import { PlayerPerformanceInfo, PlayerScoreI } from "../ts"
import { roundNumber } from "@utils/math"

export class PlayerAnnouncements {

    private static outputChannel: TextChannel

    public static async initialize() {
        console.log("initializing PlayerAnnouncements")
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

        this.outputChannel.send("@anuncios-players <@-"+player.discordUserId+"> alcanzó el Top #1 en " + countryName + "!") // to-do: add discord tagging user
    }


    // <each announcement of each case specified with needed params>

    // Player opponent or "face off" announcements



    /**
     * Send announcement about a player surpassing one or more players in ranking (global ranking)
     * @param player 
     * @param playersSurpassed 
     */
    public static async playerSurpassedPlayersInRank(player: PlayerPerformanceInfo, playersSurpassed: PlayerPerformanceInfo[]) {
        await this.outputChannel.send(`${this.getDiscordName(player)} acaba de sobrepasar a ${this.enumerateDiscordUsers(playersSurpassed)}, quedando con rank global de #${player.rank}!`)            
    }


    /**
     * Send announcement about a player surpassing one or more players in average ranked accuracy
     * @param player 
     * @param playersSurpassed 
     */
    public static async playerSurpassedPlayersInAccuracy(player: PlayerPerformanceInfo, playersSurpassed: PlayerPerformanceInfo[]) {
        await this.outputChannel.send(`${this.getDiscordName(player)} acaba de sobrepasar a ${this.enumerateDiscordUsers(playersSurpassed)} en accuracy, con un acc de ${roundNumber(player.avgAccuracy, 3)}%!`)
    }


    /**
     * Player has made the first score on a map in the whole server.
     * @param player 
     * @param score Plain js object or NewScore model.
     * @param leaderboardId 
     */
    public static async playerHasFirstScoredMap(player: SSPlayer, score: PlayerScoreI) {

    }

    /**
     * Player has made a new top score in a Leaderboard (map) in the whole server.
     * @param player 
     * @param newScore Plain js object or NewScore model.
     * @param snipedScore PlayerScore object with SSPlayer eager loaded.
     */
    public static async playerMadeTopScore(player: SSPlayer, newScore: PlayerScoreI, snipedScore: PlayerScore) {

    }

    /**
     * Player has made a new top score in a Leaderboard (map) among all registered players of their country (only for Argentina currently).
     * @param player 
     * @param newScore Plain js object or NewScore model.
     * @param snipedScore PlayerScore object with SSPlayer eager loaded.
     */
    public static async playerMadeCountryTopScore(player: SSPlayer, newScore: PlayerScoreI, snipedScore: PlayerScore) {

    }

    /**
     * Player has just improved an own score significantly (sent if there was an improvement and no other score announcement was sent)
     * @param player 
     * @param newScore Plain js object or NewScore model.
     * @param oldScore 
     */
    public static async playerSignificantlyImprovedOwnScore(player: SSPlayer, newScore: PlayerScoreI, oldScore: PlayerScore) {

    }



    /**
     * Given a list of PlayerPerformanceInfo, get a text human readable list of Discord users (with or without tagging them according to their settings)
     * @param discordUserIds 
     */
    private static enumerateDiscordUsers(playersInfo: PlayerPerformanceInfo[]): string {

        let users = ""

        if(playersInfo.length == 1) {
            users = this.getDiscordName(playersInfo[0])
        } else {
            for(let i=0; i<playersInfo.length; i++) {

                users += this.getDiscordName(playersInfo[i])

                if(i < playersInfo.length - 2) {
                    users += ", "
                } else if(i == playersInfo.length - 2) { // second last
                    users += " y a "
                }
            }
        }

        return users
    }


    /**
     * Get the Discord name or Discord mention of a player according to their announcement settings.
     * @param playerInfo 
     * @returns 
     */
    private static getDiscordName(playerInfo: PlayerPerformanceInfo) {
        //if(playerInfo.milestoneAnnouncements) { // mention it on Discord
            //return "<@" + playerInfo.discordUserId + ">"
        //} else {
            return "**" + playerInfo.playerName + "**" // bold
        //}
    }

    

    
}