import { SSPlayer } from "../model/index"
import { ScoreSaberAPI } from "../utils/index"
import { SCORES_FETCHED_PER_PAGE } from "../config"
import logger from "@utils/logger"
import { PlayerScoreSaver } from "./PlayerScoreSaver"
import { ScoreSaberDataCache, FetcherModule } from "./ScoreSaberDataCache"
import { logException } from "@utils/other"



export class PeriodicScoreFetcher {

    /**
     * Whether the fetcher is runnning
     */
    private static fetchRunning: boolean = false


    /**
     * Start ScoreSaber periodic Score fetching for all SS Players with their Discord user linked.
     * @returns 
     */
    public static async startPeriodicFetch() {

        try {

            if(this.fetchRunning) {
                logger.warn(`Periodic fetcher: Periodic Score Fetcher is already running. `)
                return
            }
    
            this.fetchRunning = true
    
            const playersToFetch = await SSPlayer.scope("discordAccountLinked").findAll()
            const api = new ScoreSaberAPI()
    
            for(const player of playersToFetch) {
    
                if(process.env.DEBUG == "true") {
                    logger.info(`Periodic fetcher: Fetching scores for ScoreSaber player ${player.name}`)
                }
    
                // Fetch whole player score list in cache because they will be needed by PlayerScoreSaver for storing player scores
                await ScoreSaberDataCache.fetchPlayerScores(player.id, FetcherModule.PERIODIC_FETCHER)
    
                let pageToFetch = 1 // start from first (most recent) page
                
                let keepFetching = true
                while(keepFetching) {
    
                    const scoresCollection = await api.getScores(player.id, "recent", pageToFetch, SCORES_FETCHED_PER_PAGE)
                    
                    if(scoresCollection && scoresCollection.playerScores.length > 0) {
    
                        if(process.env.DEBUG == "true") {
                            logger.info(`Periodic fetcher: Fetched page ${pageToFetch} of player ${player.name}. Got ${scoresCollection.playerScores.length} scores.`)
                        }
    
                        // Save scores and leaderboards for this player
                        const { newScoreListEndReached } = await PlayerScoreSaver.saveNewScoresForPlayer(player, scoresCollection)
    
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

        } catch (error) {
            logger.error("Error ocurred runnning periodic score fetcher. This call to periodic fetcher was stopped.")
            logException(error)
            this.fetchRunning = false
        }

        

    }


    
}