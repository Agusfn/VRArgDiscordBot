import logger from "@utils/logger"
import { PlayerAnnouncements } from "./PlayerAnnouncements"
import { logException } from "@utils/other"
import { PlayerScore, SSPlayer } from "../models"
import { PlayerPerformanceInfo } from "../types"
import { Countries } from "@services/ScoreSaber/types"
import { UserManager } from "@scripts/core-script/services/UserManager"
import { isScoreSignificantlyImproved } from "../utils/other"


export class PlayerTriggerEvents {


    constructor(private playerAnnouncements: PlayerAnnouncements) {

    }


    /**
     * List of player ids who are subscribed to milestone announcements.
     */
    private milestoneSubscribedPlayerIds: string[] = []

    /**
     * Cache with all of the SSPlayers global ranks. Either with their Discord account linked or not, or subscribed to announcements or not.
     */
    private playerGlobalRanks: {[playerId: string]: number} = {}
    
    /**
     * Cache with all of the SSPlayers accuracies. Either with their Discord account linked or not, or subscribed to announcements or not.
     */
    private playerAccuracies: {[playerId: string]: number} = {}

    /**
     * Cache with all of the SSPlayers countries. Either with their Discord account linked or not, or subscribed to announcements or not.
     */
    private playerCountries: {[playerId: string]: string} = {}



    public async initialize() {

        logger.info("Initializing PlayerTriggerEvents cache")

        const players = await SSPlayer.findAll()

        for(const player of players) {
            if(player.milestoneAnnouncements) {
                this.milestoneSubscribedPlayerIds.push(player.id)
            }
            this.playerGlobalRanks[player.id] = player.rank
            this.playerAccuracies[player.id] = player.avgRankedAccuracy
            this.playerCountries[player.id] = player.country
        }

    }


    /**
     * Event when a profile of a player is updated (which is done each time the player profile updater is excecuted, each hour or so)
     * @param player ScoreSaber Player with their Discord account linked
     * @param oldPlayer 
     */
    public onPlayerUpdateProfile(player: SSPlayer, oldPlayer: SSPlayer) {

        if(process.env.DEBUG == "true") {
            logger.info("event handler called for player " + player.name + " updating profile")
        }

        if(player.rank != oldPlayer.rank) {
            this.onPlayerUpdateGlobalRank(player, oldPlayer.rank, player.rank)
            this.playerGlobalRanks[player.id] = player.rank
        }
        if(player.countryRank != oldPlayer.countryRank) {
            this.onPlayerUpdateCountryRank(player, oldPlayer.countryRank, player.countryRank)
        }
        if(player.avgRankedAccuracy != oldPlayer.avgRankedAccuracy) {
            this.onPlayerUpdateAvgRankedAccuracy(player, oldPlayer.avgRankedAccuracy, player.avgRankedAccuracy)
            this.playerAccuracies[player.id] = player.avgRankedAccuracy
        }
        if(player.country != oldPlayer.country) {
            this.playerCountries[player.id] = player.country
        }

    }


    /**
     * When all of the SSPlayers are updated, this method gets called with all of the previous a new performance metrics at once for better comparison.
     * @param oldPerformances 
     * @param newPerformances 
     */
    public async onAllPlayersUpdatePerformanceInfo(oldPerformances: PlayerPerformanceInfo[], newPerformances: PlayerPerformanceInfo[]) {

        // for testing only
        // newPerformances.find(p => p.playerId == "76561198128883308").rank = 200
        // newPerformances.find(p => p.playerId == "76561198291000367").rank = 1391
        // newPerformances.find(p => p.playerId == "76561198057450492").rank = 1

        // newPerformances.find(p => p.playerId == "76561198128883308").avgAccuracy = 91.85
        // newPerformances.find(p => p.playerId == "76561198291000367").avgAccuracy = 92
        // newPerformances.find(p => p.playerId == "76561198057450492").avgAccuracy = 93
        
        //console.log("onAllPlayersUpdatePerformanceInfo called. oldPerformances: ", oldPerformances, "newPerformances: ", newPerformances)

        try {
            // Send announcement about players surpassing others in global rank
            await this.announcePlayersPerformanceDifference(oldPerformances, newPerformances, "rank", "lower")

            // Send announcement about players surpassing others in avg accuracy
            await this.announcePlayersPerformanceDifference(oldPerformances, newPerformances, "avgAccuracy", "higher")
        } catch (error) {
            logException(error)
        }


    }


    /**
     * 
     * @param oldPerformances 
     * @param newPlayerPerformances 
     * @param announceFunction 
     */
    private async announcePlayersPerformanceDifference(oldPerformances: PlayerPerformanceInfo[], newPlayerPerformances: PlayerPerformanceInfo[], attributeName: "rank" | "avgAccuracy", metricCriteria: "higher" | "lower") {

        /** Returns true if metric "a" is better than "b" according to the specified criteria. */
        const higherMetric = (a: number, b: number) => {
            if(metricCriteria == "higher") {
                return a > b
            } else {
                return b > a
            }
        }

        for(const player of newPlayerPerformances) {

            if(attributeName == "rank" && player.rank == 0) continue; // ignore announcement if player became or is inactive (rank 0)
            
            // Get old performance for this player
            const playerOldPerformance = oldPerformances.find(playerPerf => playerPerf.playerId == player.playerId) // this must exist so we don't event need to check
            if(higherMetric(player[attributeName], playerOldPerformance[attributeName])) { // player improved (lowered) their global ranking (or given metric)

                // The players surpassed by our current player
                const playersSurpassed: PlayerPerformanceInfo[] = []

                const opponentsBelow = newPlayerPerformances.filter(playerPerf => playerPerf.playerId != player.playerId && 
                    !higherMetric(playerPerf[attributeName], player[attributeName])) // users which are now worse (higher) in rank (or given metric) than updatedUser
                
                for(const opponentBelow of opponentsBelow) { // iterate over all of the players with currently lower rank than the user we're iterating
                    
                    // Get the info of the player with lower rank prior to this updatae
                    const opponentBeforeUpdate = oldPerformances.find(playerPerf => playerPerf.playerId == opponentBelow.playerId)

                    // The player with lower rank was before higher rank (or given metric) thank "player"
                    if(higherMetric(opponentBeforeUpdate[attributeName], playerOldPerformance[attributeName])) {
                        playersSurpassed.push(opponentBelow)
                    }
                }

                if(playersSurpassed.length > 0) {
                    console.log("players surpassed by " + player.playerId + ": ", playersSurpassed)
                    if(attributeName == "rank") {
                        await this.playerAnnouncements.playerSurpassedPlayersInRank(player, playersSurpassed)
                    } else if(attributeName == "avgAccuracy") {
                        await this.playerAnnouncements.playerSurpassedPlayersInAccuracy(player, playersSurpassed)
                    }
                }

            }

        }

    }


    /**
     * Handler event for when a player gets a page of new scores saved. Usually will range from 0 to 10 scores, given a fetch per hour.
     * @param player 
     * @param scores 
     */
    public async onPlayerSubmitNewScorePage(player: SSPlayer, scores: PlayerScore[]) {

        try {

            //console.log("Event handler called for player " + player.name + " submitting new score page of " + scores.length + " scores")

            for(const newScore of scores) {
    
                // Get all of the submitted scores between all players (including self) in the server for this map (Leaderboard), ignoring current score submission (which is already stored in db)
                const totalScores = await PlayerScore.scope({method: ["topScoresForEachPlayer", newScore.leaderboardId, newScore.ssId, newScore.timeSet]}).findAll()
                const topServerScore = this.getTopScoreFromPresentPlayer(totalScores);

                if(topServerScore) {
    
                    if(newScore.modifiedScore > topServerScore.modifiedScore) {
                        if(topServerScore.playerId != player.id) { // player sniped another player's top score
                            await this.playerAnnouncements.playerMadeTopServerScore(player, newScore, topServerScore)
                        } else { // player improved own top score
                            await this.playerAnnouncements.playerImprovedTopScore(player, newScore, topServerScore)
                        }
                    } else { // player didn't improve the top server score

                        // Get the top score for this map (Leaderboard) for the player's country
                        const scoresFromCountry = totalScores.filter(score => score.SSPlayer.country == player.country) 
                        const topScoreOfCountry = this.getTopScoreFromPresentPlayer(scoresFromCountry);
    
                        if(topScoreOfCountry && newScore.modifiedScore > topScoreOfCountry.modifiedScore && topScoreOfCountry.playerId != player.id &&
                            player.country == Countries.ARGENTINA) // argentina is temporarily the only who has top country announcement (because all top players are registered in the bot)) { 
                        {
                            await this.playerAnnouncements.playerMadeTopCountryScore(player, newScore, topScoreOfCountry) // player sniper another player's top country score
                        } else {

                            // Get the best score for this map for this player (if it exists)
                            const playerPreviousScores = totalScores.filter(score => score.playerId == player.id)
                            const previousPlayerTopScore = playerPreviousScores.length > 0 ? playerPreviousScores.reduce((prev, current) => current.modifiedScore > prev.modifiedScore ? current : prev) : null
                            
                            if(previousPlayerTopScore && isScoreSignificantlyImproved(previousPlayerTopScore.accuracy, newScore.accuracy)) {
                                await this.playerAnnouncements.playerSignificantlyImprovedOwnScore(player, newScore, previousPlayerTopScore)
                            }
                        }
                    }
    
                } else { // no players submitted any score for this leaderboard
                    await this.playerAnnouncements.playerHasFirstScoredRankedMap(player, newScore)
                }
    
                // future: if player improved score than any of their opponents (use existing query)
                    // send announcement for each opponent
            }

        } catch(error) {
            logException(error)
        }

    }

    /**
     * From a list of PlayerScores of a specific leaderboard with eager loaded SSPlayers, 
     * obtain the highest score of a player present in the server.
     * @param scores array with scores
     */
    private getTopScoreFromPresentPlayer(scores: PlayerScore[]): PlayerScore {
        if(Array.isArray(scores) && scores.length > 0) {
            let maxScore: PlayerScore = null;

            for(const score of scores) {
                if(!UserManager.isUserPresent(score.SSPlayer?.discordUserId)) continue; // ignore players not present on the server
                if(!maxScore || score.modifiedScore > maxScore.modifiedScore) {
                    maxScore = score;
                }
            }

            return maxScore;
        } else {
            return null;
        }
    }


    private onPlayerUpdateAvgRankedAccuracy(player: SSPlayer, oldAccuracy: number, newAccuracy: number) {
        // if player surpassed any other player subscribed in milestones
            // send acc surpass announcement of said players

        // if player improved acc than any of their opponents (use static var)
            // send announcement of acc surpass for each opponent
    }

    private onPlayerUpdateGlobalRank(player: SSPlayer, oldRank: number, newRank: number) {
        // if player surpassed any other player subscribed in milestones
            // send global rank surpass announcement of said players

        // if player improved global rank than any of their opponents (use static var)
            // send announcement of global rank surpass for each opponent

        
        // Once


    }

    private onPlayerUpdateCountryRank(player: SSPlayer, oldRank: number, newRank: number) {
        if(newRank == 1) {
            this.playerAnnouncements.sendForPlayerTop1Country(player, player.country)
        }
    }



    
    
}