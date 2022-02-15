import { SSPlayer } from "../model/index"
import { PlayerPerformanceInfo, PlayerScoreI } from "../ts"
import logger from "@utils/logger"
import { PlayerAnnouncements } from "./PlayerAnnouncements"

export class PlayerTriggerEvents {



    /**
     * List of player ids who are subscribed to milestone announcements.
     */
    private static milestoneSubscribedPlayerIds: string[] = []

    /**
     * Cache with all of the SSPlayers global ranks. Either with their Discord account linked or not, or subscribed to announcements or not.
     */
    private static playerGlobalRanks: {[playerId: string]: number} = {}
    
    /**
     * Cache with all of the SSPlayers accuracies. Either with their Discord account linked or not, or subscribed to announcements or not.
     */
    private static playerAccuracies: {[playerId: string]: number} = {}

    /**
     * Cache with all of the SSPlayers countries. Either with their Discord account linked or not, or subscribed to announcements or not.
     */
    private static playerCountries: {[playerId: string]: string} = {}


    public static async initialize() {

        logger.info("Initializing PlayerTriggerEvents cache")

        await PlayerAnnouncements.initialize()

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
    public static onPlayerUpdateProfile(player: SSPlayer, oldPlayer: SSPlayer) {

        logger.info("event handler called for player " + player.name + " updating profile")

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
    public static onAllPlayersUpdatePerformanceInfo(oldPerformances: PlayerPerformanceInfo[], newPerformances: PlayerPerformanceInfo[]) {

        for(const updatedPlayer of newPerformances) {
            
            const oldPlayer = oldPerformances.find(player => player.discordUserId == updatedPlayer.discordUserId) // this must exist so we don't event need to check
            
            if(updatedPlayer.globalRank < oldPlayer.globalRank) { // player improved (lowered) their country ranking

                const playersSurpassed: UserRankInfo[] = []
                const usersBelowUpdatedUser = this.comparedUsersAfterUpdate.filter(user => user.globalRank > updatedPlayer.globalRank) // users which are now worse (higher) rank than updatedUser
                
                for(const lowerRankUser of usersBelowUpdatedUser) { // iterate over all of the players with currently lower rank than the user we're iterating

                    const lowerRankUserBeforeUpdate = this.comparedUsersBeforeUpdate.find(user => user.discordUserId == lowerRankUser.discordUserId)

                    if(lowerRankUserBeforeUpdate.globalRank < oldPlayer.globalRank) { // the lowerRankUser had better (lower) rank than updatedUser before the update => it was surpassed by updatedUser
                        playersSurpassed.push(lowerRankUser)
                    }
                }

                if(playersSurpassed.length > 0) {
                    this.sendPlayerSurpassAnnouncement(updatedPlayer, playersSurpassed)
                }

            }

        }


    }


    public static onPlayerSubmitNewScorePage(player: SSPlayer, scores: PlayerScoreI[]) {

        console.log("event handler called for player " + player.name + " submitting new score page of " + scores.length)

        // if score is best among all players (existing at least one). needs db query
            // send top score announcement
        // else if score is best among all players of said country (existing at least once). needs db query, maybe use prior
            // send top score of map in said country announcement
        // else if score is first among all players
            // send announcement of first score in song
        // else if score is "significantly improved" than before score of user
            // send announcement about significant improvement of score

        
        // if player improved score than any of their opponents (use existing query)
            // send announcement for each opponent
    }


    private static onPlayerUpdateAvgRankedAccuracy(player: SSPlayer, oldAccuracy: number, newAccuracy: number) {
        // if player surpassed any other player subscribed in milestones
            // send acc surpass announcement of said players

        // if player improved acc than any of their opponents (use static var)
            // send announcement of acc surpass for each opponent
    }

    private static onPlayerUpdateGlobalRank(player: SSPlayer, oldRank: number, newRank: number) {
        // if player surpassed any other player subscribed in milestones
            // send global rank surpass announcement of said players

        // if player improved global rank than any of their opponents (use static var)
            // send announcement of global rank surpass for each opponent

        
        // Once


    }

    private static onPlayerUpdateCountryRank(player: SSPlayer, oldRank: number, newRank: number) {
        if(newRank == 1) {
            PlayerAnnouncements.sendForPlayerTop1Country(player, player.country)
        }
    }



    
    
}