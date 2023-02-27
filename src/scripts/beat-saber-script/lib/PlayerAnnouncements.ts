import { SSPlayer, PlayerScore, Leaderboard } from "../model/index"
import { formatAcc, ScoreSaberAPI } from "../utils/index"
import { Discord } from "@lib/Discord"
import { TextChannel } from "discord.js"
import { SSCountries } from "../config"
import { PlayerPerformanceInfo, PlayerScoreI, SSPlayerI } from "../ts"
import { roundNumber } from "@utils/math"
import { UserManager } from "@lib/UserManager"

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
    public static async sendForPlayerTop1Country(player: SSPlayer, country: SSCountries) {
        await this.outputChannel.send(`**${player.name}** alcanzó el Top #1 en ${this.getCountry(country)}!`) // to-do: add discord tagging user
    }


    // <each announcement of each case specified with needed params>

    // Player opponent or "face off" announcements



    /**
     * Send announcement about a player surpassing one or more players in ranking (global ranking)
     * @param player 
     * @param playersSurpassed 
     */
    public static async playerSurpassedPlayersInRank(player: PlayerPerformanceInfo, playersSurpassed: PlayerPerformanceInfo[]) {
        await this.outputChannel.send(`**${player.playerName}** acaba de sobrepasar a ${this.enumerateDiscordUsers(playersSurpassed)}, quedando con rank global de #${player.rank}!`)            
    }


    /**
     * Send announcement about a player surpassing one or more players in average ranked accuracy
     * @param player 
     * @param playersSurpassed 
     */
    public static async playerSurpassedPlayersInAccuracy(player: PlayerPerformanceInfo, playersSurpassed: PlayerPerformanceInfo[]) {
        if(playersSurpassed.length > 1) {
            await this.outputChannel.send(`**${player.playerName}** acaba de sobrepasar en accuracy ranked promedio a ${this.enumerateDiscordUsers(playersSurpassed)} con un acc de **${formatAcc(player.avgAccuracy)}**!`)
        } else if(playersSurpassed.length == 1) {
            await this.outputChannel.send(`**${player.playerName}** acaba de sobrepasar en accuracy ranked promedio a ${this.discordMentionFromInfo(playersSurpassed[0])} (${formatAcc(playersSurpassed[0].avgAccuracy)}) con un acc de **${formatAcc(player.avgAccuracy)}**!`)
        }
    }


    /**
     * Player has made the first score on a map in the whole server.
     * @param player 
     * @param score Plain js object or NewScore model.
     * @param leaderboardId 
     */
    public static async playerHasFirstScoredRankedMap(player: SSPlayer, score: PlayerScoreI) {

        const leaderboard = await Leaderboard.findByPk(score.leaderboardId)

        if(leaderboard.ranked) {
            let message = "**" + player.name + "** hizo el primer score del server en el mapa " + leaderboard.readableMapDesc() + ", con un acc de **" + 
            formatAcc(score.accuracy) + "** y obteniendo **"+roundNumber(score.pp, 1)+"pp**!" 
            await this.outputChannel.send(message)
        }
    }


    /**
     * Player has made a new top score in a Leaderboard (map) in the whole server, sniping a previous top score.
     * @param player 
     * @param newScore Plain js object or NewScore model.
     * @param snipedScore PlayerScore object with SSPlayer eager loaded.
     */
    public static async playerMadeTopScore(player: SSPlayer, newScore: PlayerScoreI, snipedScore: PlayerScore) {

        const leaderboard = await Leaderboard.findByPk(newScore.leaderboardId)

        let message = "**" + player.name + "** hizo un top score del server :first_place:  en el mapa "+leaderboard.readableMapDesc()
        
        if(leaderboard.ranked) {
            message += " con un acc de **" + formatAcc(newScore.accuracy) + "** y obteniendo **" + roundNumber(newScore.pp, 1) + "pp**, snipeando a " + this.discordMention(snipedScore.SSPlayer) + " (" + formatAcc(snipedScore.accuracy) + ")!"
        } else {
            message += ", snipeando a " + this.discordMention(snipedScore.SSPlayer) + "!"  // acc and pp is not available in unranked maps
        }


        await this.outputChannel.send(message)
    }

    /**
     * Player has improved his score in a leaderboard he already had a top score in the server.
     * @param player 
     * @param newScore Plain js object or NewScore model.
     * @param snipedScore PlayerScore object with SSPlayer eager loaded.
     */
     public static async playerImprovedTopScore(player: SSPlayer, newScore: PlayerScoreI, oldScore: PlayerScore) {

        const leaderboard = await Leaderboard.findByPk(newScore.leaderboardId)

        if(leaderboard.ranked) {
            let message = "**" + player.name + "** mejoró su top score del server :first_place:  en el mapa "+leaderboard.readableMapDesc()+" (**" + 
            formatAcc(oldScore.accuracy) + "** --> **" + formatAcc(newScore.accuracy) + "**) obteniendo **"+ roundNumber(newScore.pp, 1) + "pp**!"
            await this.outputChannel.send(message)
        }
    }


    /**
     * Player has made a new top score in a Leaderboard (map) among all registered players of their country (only for Argentina currently).
     * @param player 
     * @param newScore Plain js object or NewScore model.
     * @param snipedScore PlayerScore object with SSPlayer eager loaded.
     */
    public static async playerMadeCountryTopScore(player: SSPlayer, newScore: PlayerScoreI, snipedScore: PlayerScore) {

        const leaderboard = await Leaderboard.findByPk(newScore.leaderboardId)

        let message = "**" + player.name + "** hizo un top score en " + this.getCountry(<SSCountries>player.country) + "  en el mapa " + leaderboard.readableMapDesc()

        if(leaderboard.ranked) {
            message += " con un acc de **" + formatAcc(newScore.accuracy) + "** y obteniendo **" + roundNumber(newScore.pp, 1) + "pp**, snipeando a " + this.discordMention(snipedScore.SSPlayer) + " (" + formatAcc(snipedScore.accuracy) + ")!"
        } else {
            message += ", snipeando a " + this.discordMention(snipedScore.SSPlayer) + "!"  // acc and pp is not available in unranked maps
        }

        await this.outputChannel.send(message)
    }

    /**
     * Player has just improved an own score significantly (sent if there was an improvement and no other score announcement was sent)
     * @param player 
     * @param newScore Plain js object or NewScore model.
     * @param oldScore 
     */
    public static async playerSignificantlyImprovedOwnScore(player: SSPlayer, newScore: PlayerScoreI, oldScore: PlayerScore) {
        
        const leaderboard = await Leaderboard.findByPk(newScore.leaderboardId)

        if(leaderboard.ranked) {
            let message = "**" + player.name + "** mejoró significativamente su score en el mapa ranked " + leaderboard.readableMapDesc() + "(**" + 
            formatAcc(oldScore.accuracy) + "** --> **" + formatAcc(newScore.accuracy) + "**) obteniendo **" + roundNumber(newScore.pp, 1) + "pp**!"
            await this.outputChannel.send(message)
        }

    }



    /**
     * Given a list of PlayerPerformanceInfo, get a text human readable list of Discord users (with or without tagging them according to their settings)
     * @param discordUserIds 
     */
    private static enumerateDiscordUsers(playersInfo: PlayerPerformanceInfo[]): string {

        let users = ""

        if(playersInfo.length == 1) {
            users = this.discordMentionFromInfo(playersInfo[0])
        } else {
            for(let i=0; i<playersInfo.length; i++) {

                users += this.discordMentionFromInfo(playersInfo[i])

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
    private static discordMentionFromInfo(playerInfo: PlayerPerformanceInfo) {
        if(playerInfo.milestoneAnnouncements) { // mention it on Discord
            return "<@" + playerInfo.discordUserId + ">"
        } else {
            return "**" + playerInfo.playerName + "**" // bold
        }
    }

    /**
     * Given a SSPlayer model or plain js object, get the readable name of the player or its mention, according to their announcement settings.
     * @param player 
     */
    private static discordMention(player: SSPlayerI) {
        if(UserManager.isUserPresent(player.discordUserId) && player.milestoneAnnouncements) {
            return "<@" + player.discordUserId + ">"
        } else {
            return "**" + player.name + "**"
        }
    }





    private static getCountry(country: SSCountries) {
        let countryName: string = country;
        if(country == SSCountries.ARGENTINA) {
            countryName = "Argentina :flag_ar:"
        }
        return countryName
    }

    
}