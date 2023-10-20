import { SSPlayer } from "../../model/index"
import { ScoreSaberAPI } from "../../utils/index"
import { SCORES_FETCHED_PER_PAGE } from "../../config"
import logger from "@utils/logger"
import { PlayerScoreSaver } from "../PlayerScoreSaver"
import { ScoreSaberDataCache } from "../ScoreSaberDataCache"
import { logException } from "@utils/other"
import { UserManager } from "@lib/UserManager"
import Cron from "./Cron"


export class PeriodicScoreFetcherCron extends Cron {

    // services
    private ssCache: ScoreSaberDataCache;
    private playerScoreSaver: PlayerScoreSaver;
    private ssApi = new ScoreSaberAPI();

    constructor(ssCache: ScoreSaberDataCache, cronExp: string) {
        super(cronExp);

        this.ssCache = ssCache;
        this.playerScoreSaver = new PlayerScoreSaver(ssCache);
    }


    /**
     * Start ScoreSaber periodic Score fetching for all SS Players with their Discord user linked.
     * @returns 
     */
    protected async tick() {

        try {

            if(this.running) {
                logger.warn(`Periodic fetcher: Periodic Score Fetcher is already running. `)
                return
            }
    
            this.running = true
    
            const playersToFetch = await SSPlayer.scope("discordAccountLinked").findAll()
    
            for(const player of playersToFetch) {
                
                if(!UserManager.isUserPresent(player.discordUserId)) continue; // skip players not on server

                logger.debug(`Periodic fetcher: Fetching scores for ScoreSaber player ${player.name}`)
    
                // Fetch whole player score list in cache because they will be needed by PlayerScoreSaver for storing player scores
                await this.ssCache.fetchPlayerScores(player.id, "periodic_fetcher")
    
                let pageToFetch = 1 // start from first (most recent) page
                
                let keepFetching = true
                while(keepFetching) {
    
                    const scoresCollection = await this.ssApi.getScores(player.id, "recent", pageToFetch, SCORES_FETCHED_PER_PAGE)
                    
                    if(scoresCollection && scoresCollection.playerScores.length > 0) {
    
                        logger.debug(`Periodic fetcher: Fetched page ${pageToFetch} of player ${player.name}. Got ${scoresCollection.playerScores.length} scores.`)

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
                this.ssCache.finishUsingPlayerScores(player.id, "periodic_fetcher")
            }
    
            this.running = false

        } catch (error) {
            logger.error("Error ocurred runnning periodic score fetcher. This call to periodic fetcher was stopped.")
            logException(error)
            this.running = false
        }

        

    }


    
}