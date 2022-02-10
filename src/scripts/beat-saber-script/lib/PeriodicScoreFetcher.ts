import { SSPlayer } from "../model/index"
import { ScoreSaberAPI } from "../utils/index"
import { SCORES_FETCHED_PER_PAGE } from "../config"
import logger from "@utils/logger"
import { PlayerScoreSaver } from "./PlayerScoreSaver"
import { ScoreSaberDataCache, FetcherModule } from "./ScoreSaberDataCache"



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

        if(this.fetchRunning) {
            logger.warn(`Periodic Score Fetcher is already running. `)
            return
        }

        this.fetchRunning = true

        const playersToFetch = await SSPlayer.scope("discordAccountLinked").findAll()
        const api = new ScoreSaberAPI()

        for(const player of playersToFetch) {

            if(process.env.DEBUG == "true") {
                logger.info(`Fetching periodic scores for ScoreSaber player ${player.name}`)
            }

            // Fetch whole player score list in cache because they will be needed by PlayerScoreSaver for storing player scores
            await ScoreSaberDataCache.fetchPlayerScores(player.id, FetcherModule.PERIODIC_FETCHER)

            let pageToFetch = 1 // start from first (most recent) page
            
            let keepFetching = true
            while(keepFetching) {

                const scoresCollection = await api.getScores(player.id, "recent", pageToFetch, SCORES_FETCHED_PER_PAGE)
                
                if(process.env.DEBUG == "true") {
                    logger.info(`Fetched page ${pageToFetch} for periodic score fetch of player ${player.id}. Got ${scoresCollection.playerScores.length} scores.`)
                }

                if(scoresCollection && scoresCollection.playerScores.length > 0) {

                    // Save scores and leaderboards for this player
                    const { repeatedScoresReached } = await PlayerScoreSaver.saveNewScoresForPlayer(player, scoresCollection)

                    if(repeatedScoresReached) {
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

    }


    
}