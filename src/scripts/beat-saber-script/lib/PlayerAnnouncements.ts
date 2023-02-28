import { SSPlayer, PlayerScore, Leaderboard } from "../model/index"
import { formatAcc } from "../utils/index"
import { Discord } from "@lib/Discord"
import { TextChannel } from "discord.js"
import { PlayerPerformanceInfo, PlayerScoreI, SSPlayerI } from "../ts"
import { roundNumber } from "@utils/math"
import { UserManager } from "@lib/UserManager"
import { countryNames } from "../utils/countries";

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

        const message = `:fireworks: :first_place:  **${player.name}** alcanzó el Top #1 en ${this.getCountryNameMsg(country)}!`;

        await this.outputChannel.send(message);
    }


    /**
     * Send announcement about a player surpassing one or more players in ranking (global ranking)
     * @param player 
     * @param playersSurpassed 
     */
    public static async playerSurpassedPlayersInRank(player: PlayerPerformanceInfo, playersSurpassed: PlayerPerformanceInfo[]) {

        const message = `:checkered_flag:  **${player.playerName}** acaba de sobrepasar a ${this.enumerateDiscordUsers(playersSurpassed)},`
            + ` quedando con rank global de #${player.rank}!`;

        await this.outputChannel.send(message)            
    }


    /**
     * Send announcement about a player surpassing one or more players in average ranked accuracy
     * @param player 
     * @param playersSurpassed 
     */
    public static async playerSurpassedPlayersInAccuracy(player: PlayerPerformanceInfo, playersSurpassed: PlayerPerformanceInfo[]) {

        let message = `:dart:  **${player.playerName}** acaba de sobrepasar en accuracy ranked promedio a `;

        if(playersSurpassed.length > 1) {
            message += `${this.enumerateDiscordUsers(playersSurpassed)}`;
        } else if(playersSurpassed.length == 1) {
            message += `${this.discordMentionFromInfo(playersSurpassed[0])} (${formatAcc(playersSurpassed[0].avgAccuracy)})`;
        }

        message += ` con un acc de **${formatAcc(player.avgAccuracy)}**!`;

        await this.outputChannel.send(message);

    }



    /**
     * Player has made the first score on a map in the whole server.
     * @param player 
     * @param score Plain js object or NewScore model.
     * @param leaderboardId 
     */
    public static async playerHasFirstScoredRankedMap(player: SSPlayer, score: PlayerScoreI) {

        const leaderboard = await Leaderboard.findByPk(score.leaderboardId);

        if(!leaderboard.ranked) return; // ignore if unranked map

        const message = `:stars:  **${player.name}** hizo el primer score del server en el mapa ${leaderboard.readableMapDesc()}, con un acc de ` + 
            `**${formatAcc(score.accuracy)}** (#${score.rank}) y obteniendo **${roundNumber(score.pp, 1)}pp**!`;

        await this.outputChannel.send(message)
        
    }


    /**
     * Player has made a new top score in a Leaderboard (map) in the whole server, sniping a previous top score.
     * @param player 
     * @param newScore Plain js object or NewScore model.
     * @param snipedScore PlayerScore object with SSPlayer eager loaded.
     */
    public static async playerMadeTopServerScore(player: SSPlayer, newScore: PlayerScoreI, snipedScore: PlayerScore) {

        const leaderboard = await Leaderboard.findByPk(newScore.leaderboardId)

        let message = `:first_place:  **${player.name}** hizo un top score del server `;
        message += this.getSnipedScoreDetailsMessage(leaderboard, newScore, snipedScore);

        await this.outputChannel.send(message)
    }


    /**
     * Player has made a new top score in a Leaderboard (map) among all registered players of their country (only for Argentina currently).
     * @param player 
     * @param newScore Plain js object or NewScore model.
     * @param snipedScore PlayerScore object with SSPlayer eager loaded.
     */
    public static async playerMadeTopCountryScore(player: SSPlayer, newScore: PlayerScoreI, snipedScore: PlayerScore) {

        const leaderboard = await Leaderboard.findByPk(newScore.leaderboardId)
        const countryCode = player.country.toLocaleLowerCase();

        let message = `:flag_${countryCode}:  **${player.name}** hizo un top score en ${this.getCountryNameMsg(player.country)}  `;
        message += this.getSnipedScoreDetailsMessage(leaderboard, newScore, snipedScore);

        await this.outputChannel.send(message)
    }


    /**
     * Get the portion of the message to be sent to the sniped score announcement.
     * @param leaderboard 
     * @param newScore 
     * @param snipedScore 
     * @returns 
     */
    private static getSnipedScoreDetailsMessage(leaderboard: Leaderboard, newScore: PlayerScoreI, snipedScore: PlayerScore): string {
        let message = "";

        message += `en el mapa ${leaderboard.readableMapDesc()}`;
        if(newScore.accuracy != null) { // all ranked maps have acc, and newest unranked also. Old unranked don't.
            message += ` con un acc de **${formatAcc(newScore.accuracy)}**`;
        }
        if(newScore.rank) { // global rank of the score. all newest maps should have them
            message += ` (#${newScore.rank})`;
        }
        if(leaderboard.ranked) {
            message += ` y obteniendo **${roundNumber(newScore.pp, 1)}pp**`;
        }
        message += `, snipeando a ${this.discordMention(snipedScore.SSPlayer)}`;
        if(snipedScore.accuracy) {
            message += ` (${formatAcc(snipedScore.accuracy)})`;
        }
        message += "!";

        return message;
    }


    /**
     * Player has improved his score in a leaderboard he already had a top score in the server.
     * @param player 
     * @param newScore Plain js object or NewScore model.
     * @param snipedScore PlayerScore object with SSPlayer eager loaded.
     */
     public static async playerImprovedTopScore(player: SSPlayer, newScore: PlayerScoreI, oldScore: PlayerScore) {

        const leaderboard = await Leaderboard.findByPk(newScore.leaderboardId)

        if(!leaderboard.ranked) return; // ignore if unranked map
            
        const message = `:first_place:  **${player.name}** mejoró su top score del server en el mapa ${leaderboard.readableMapDesc()}: ` + 
            `**${formatAcc(oldScore.accuracy)}** --> **${formatAcc(newScore.accuracy)}** (#${newScore.rank}) obteniendo **${roundNumber(newScore.pp, 1)}pp**!`;
        
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

        if(!leaderboard.ranked) return; // ignore if unranked map

        const message = `:chart_with_upwards_trend:  **${player.name}** mejoró significativamente su score en el mapa ranked ${leaderboard.readableMapDesc()}: ` + 
            `**${formatAcc(oldScore.accuracy)}** --> **${formatAcc(newScore.accuracy)}** (#${newScore.rank}) obteniendo **${roundNumber(newScore.pp, 1)}pp**!`;

        await this.outputChannel.send(message)
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
        if(UserManager.isUserPresent(playerInfo.discordUserId) && playerInfo.milestoneAnnouncements) { // mention it on Discord
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


    /**
     * Get the country name with an emoji of a flag as a discord message, for a given country code.
     * @param countryCode The 2 char country code ISO coming from ScoreSaber Player country.
     * @returns 
     */
    private static getCountryNameMsg(countryCode: string) {

        // Get country name
        let countryName: string = countryNames[countryCode];
        if(!countryName) {
            countryName = countryCode;
        }

        const countryMsg = `${countryName} :flag_${countryCode.toLowerCase()}:`;
        return countryMsg
    }

    
}