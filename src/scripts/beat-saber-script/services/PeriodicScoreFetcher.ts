import { SCORES_FETCHED_PER_PAGE } from "../config"
import logger from "@utils/logger"
import { PlayerScoreSaver } from "./PlayerScoreSaver"
import { ScoreSaberDataCache, FetcherModule } from "./ScoreSaberDataCache"
import { logException } from "@utils/other"
import { ScoreSaberAPI } from "@services/ScoreSaber/ScoreSaberAPI"
import { SSPlayer } from "../models"
import { UserManager } from "@scripts/core-script/services/UserManager"



export class PeriodicScoreFetcher {

    /**
     * Whether the fetcher is runnning
     */
    private fetchRunning: boolean = false


    constructor(private playerScoreSaver: PlayerScoreSaver) {

    }


    /**
     * Start ScoreSaber periodic Score fetching for all SS Players with their Discord user linked.
     * @returns 
     */
    public async checkPlayersNewScores() {

        try {

            if(this.fetchRunning) {
                logger.warn(`Periodic fetcher: Periodic Score Fetcher is already running. `)
                return
            }
    
            this.fetchRunning = true
    
            const playersToFetch = await SSPlayer.scope("discordAccountLinked").findAll()
            const api = new ScoreSaberAPI()
    
            for(const player of playersToFetch) {
                
                if(!UserManager.isUserPresent(player.discordUserId)) continue; // skip players not on server

                if(process.env.DEBUG == "true") {
                    logger.info(`Periodic fetcher: Fetching scores for ScoreSaber player ${player.name}`)
                }
    
                // Fetch whole player score list in cache because they will be needed by PlayerScoreSaver for storing player scores
                await ScoreSaberDataCache.fetchPlayerScores(player.id, FetcherModule.PERIODIC_FETCHER) // to-do: store this cache in an instanced object, and pass it to the module that will require it
    
                let pageToFetch = 1 // start from first (most recent) page
                
                let keepFetching = true
                while(keepFetching) {
    
                    const scoresCollection = await api.getScores(player.id, "recent", pageToFetch, SCORES_FETCHED_PER_PAGE)
                    
                    if(scoresCollection && scoresCollection.playerScores.length > 0) {
    
                        if(process.env.DEBUG == "true") {
                            logger.info(`Periodic fetcher: Fetched page ${pageToFetch} of player ${player.name}. Got ${scoresCollection.playerScores.length} scores.`)
                        }
    
                        // Save scores and leaderboards for this player
                        const { newScoreListEndReached } = await this.playerScoreSaver.saveNewScoresForPlayer(player, scoresCollection)
    
                        if(newScoreListEndReached) {
                            keepFetching = false
                        } else {
                            pageToFetch += 1
                        }
                    } else {
                        keepFetching = true
                    }
                }
    
                // Clean player score cache
                ScoreSaberDataCache.finishUsingPlayerScores(player.id, FetcherModule.PERIODIC_FETCHER)
            }
    
            this.fetchRunning = false

        } catch (error: any) {
            logger.error("Error ocurred runnning periodic score fetcher. This call to periodic fetcher was stopped.")
            logger.error(error?.stack || error);
            this.fetchRunning = false
        }

        

    }


    
}