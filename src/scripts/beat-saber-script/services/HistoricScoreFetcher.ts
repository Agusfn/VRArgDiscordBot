import logger from "@utils/logger"
import { PlayerScoreSaver } from "./PlayerScoreSaver"
import { ScoreSaberDataCache, FetcherModule } from "./ScoreSaberDataCache"
import { SCORES_FETCHED_PER_PAGE } from "../config"
import { ScoreSaberAPI } from "@services/ScoreSaber/ScoreSaberAPI"
import { SSPlayer } from "../models"


/**
 * Class that handles the fetching of historic scores for ScoreSaber users. 
 * Each time a SSPlayer is registered, all of its historic scores will be fetched sequentially.
 */
export class HistoricScoreFetcher {
    
    private fetchRunning: boolean = false
    private playerFetchQueue: SSPlayer[] = []


    /**
     * Start historic score fetcher by adding all pending fetch users to fetch queue and processing it.
     */
     public async startFetcher() {

        if(this.fetchRunning) return // don't start if already running
        this.fetchRunning = true

        // Load in queue all pending players from DB that are not already in the queue (useful when resuming the fetch after an interruption)
        const playersPendingFetch = await SSPlayer.scope("pendingHistoricFetch").findAll()
        playersPendingFetch.forEach(playerPending => {
            if(!this.playerFetchQueue.find(player => player.id == playerPending.id)) { // ommit players if already in queue (queue was pre filled with players)
                this.playerFetchQueue.push(playerPending)
            }
        })

        await this.processFetchQueue()

        this.fetchRunning = false
    }


    /**
     * Add a player to the fetch queue and start the fetcher (if not already running)
     * @param ssPlayerId 
     */
    public async addPlayerToQueueAndStartFetcher(ssPlayerId: string) {
        
        const ssPlayer = await SSPlayer.findByPk(ssPlayerId)
        if(!ssPlayer) {
            logger.warn(`Historic fetcher: ScoreSaber player id ${ssPlayerId} was not found in DB.`)
            return
        }
        if(this.playerFetchQueue.find(player => player.id == ssPlayerId)) {
            logger.warn(`Historic fetcher: ScoreSaber player id ${ssPlayerId} is already present in fetch queue, did not add again.`)
            return
        }

        if(process.env.DEBUG == "true") {
            logger.info("Historic fetcher: Adding SS player " + ssPlayerId + " to fetch queue")
        }

        this.playerFetchQueue.push(ssPlayer)

        // run fetcher if not already running
        if(!this.fetchRunning) { 
            this.startFetcher() // async
        }

    }


    /**
     * Fetch the historic scores for each SSPlayer of the fetch queue.
     */
    private async processFetchQueue() {

        if(process.env.DEBUG == "true") {
            logger.info("Historic fetcher: Starting fetch queue with " + this.playerFetchQueue.length + " players in it.")
        }

        while(this.playerFetchQueue.length > 0) {
            try {
                const ssPlayer = this.playerFetchQueue[0] // grab first in queue
                await this.fetchHistoricScoresForSSPlayer(ssPlayer)
                this.playerFetchQueue.shift() // remove first elem

                if(process.env.DEBUG == "true") {
                    logger.info("Historic fetcher: Fetched all history for SS player " + ssPlayer.id + ". New queue length: " + this.playerFetchQueue.length)
                }
                
            } catch(error) {
                // if max retries
                    // set waitingForRetry true
                    // set timer in X seconds to re-run
                console.log(error)
                break
            }
        }

        if(process.env.DEBUG == "true") {
            logger.info("Historic fetcher: Finished historic SS score fetcher queue.")
        }

    }


    /**
     * Fetch all historic scores for a given ScoreSaberPlayer (SSPlayer)
     * @param player 
     */
    private async fetchHistoricScoresForSSPlayer(player: SSPlayer) {

        if(process.env.DEBUG == "true") {
            logger.info(`Historic fetcher: Starting fetch for ScoreSaber player ${player.name}`)
        }

        await ScoreSaberDataCache.fetchPlayerScores(player.id, FetcherModule.HISTORIC_FETCHER) // fetch player score ids from cache if not already fetched

        let endPageReached = false
        let nextFetchPage = player.lastHistoryFetchPage + 1 // most recent page is 1
        
        const api = new ScoreSaberAPI()

        while(endPageReached != true) {

            // Fetch scores of following page
            const scorePageCollection = await api.getScores(player.id, "recent", nextFetchPage, SCORES_FETCHED_PER_PAGE)

            if(scorePageCollection && scorePageCollection.playerScores.length > 0) {

                if(process.env.DEBUG == "true") {
                    logger.info(`Historic fetcher: Fetched page ${nextFetchPage} of player ${player.name}. Got ${scorePageCollection.playerScores.length} scores.`)
                }

                await PlayerScoreSaver.saveHistoricScorePageForPlayer(player, scorePageCollection)

                player.lastHistoryFetchPage = nextFetchPage
                await player.save()
                nextFetchPage += 1
            } else { // end page reached
                if(process.env.DEBUG == "true") {
                    logger.info(`Historic fetcher: Finished loading scores for ScoreSaber player ${player.name} (id ${player.id})`)
                }
                endPageReached = true
                player.fetchedAllScoreHistory = true
                await player.save()
            }

        }

        ScoreSaberDataCache.finishUsingPlayerScores(player.id, FetcherModule.HISTORIC_FETCHER) // erase score cache for player (if not other module is using it)

    }
    
    
}