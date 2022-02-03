import { Op } from "sequelize"
import logger from "@utils/logger"
import { SSPlayer, PlayerScore } from "../model/index"
import { ScoreSaberAPI } from "../utils/index"
import { PlayerScoreSaver } from "./PlayerScoreSaver"

const SCORES_FETCHED_PER_PAGE = 100


/**
 * Class that handles the fetching of historic scores for ScoreSaber users. 
 * Each time a SSPlayer is registered, all of its historic scores will be fetched sequentially.
 */
export class HistoricScoreFetcher {
    
    private static fetchRunning: boolean = false
    private static playerFetchQueue: SSPlayer[] = []


    /**
     * Start historic score fetcher by adding all pending fetch users to fetch queue and processing it.
     */
     public static async startFetcher() {

        if(this.fetchRunning) return
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
    public static async addPlayerToQueueAndStartFetcher(ssPlayerId: string) {
        
        const ssPlayer = await SSPlayer.findByPk(ssPlayerId)
        if(!ssPlayer) {
            logger.warn(`ScoreSaber player id ${ssPlayerId} was not found in DB.`)
            return
        }
        if(this.playerFetchQueue.find(player => player.id == ssPlayerId)) {
            logger.warn(`ScoreSaber player id ${ssPlayerId} is already present in fetch queue, did not add again.`)
            return
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
    private static async processFetchQueue() {

        while(this.playerFetchQueue.length > 0) {
            try {
                const ssPlayer = this.playerFetchQueue[0] // grab first in queue
                await this.fetchHistoricScoresForSSPlayer(ssPlayer)
                this.playerFetchQueue.shift() // remove first elem
            } catch(error) {
                // if max retries
                    // set waitingForRetry true
                    // set timer in X seconds to re-run
                // if other error
                    // log and break excecution
                    
            }
        }

    }


    /**
     * Fetch all historic scores for a given ScoreSaberPlayer (SSPlayer)
     * @param player 
     */
    private static async fetchHistoricScoresForSSPlayer(player: SSPlayer) {

        if(process.env.DEBUG == "true") {
            logger.info(`Starting historic score fetch for ScoreSaber player ${player.name}`)
        }

        // Get an array from DB of ALL existing score ids of this player, so we can make sure to add only new scores
        const allPlayerScoreIds = (await PlayerScore.findAll({
            where: { playerId: player.id },
            attributes: ["id"]
        })).map(score => score.id)

        console.log("player " + player.name + " all score ids: ", allPlayerScoreIds)
        
        let endPageReached = false
        let nextFetchPage = player.lastHistoryFetchPage + 1 // most recent page is 1
        const api = new ScoreSaberAPI()

        //let songsLoaded = 0

        while(endPageReached != true) {

            // Fetch scores of following page
            const scorePageCollection = await api.getScores(player.id, "recent", nextFetchPage, SCORES_FETCHED_PER_PAGE)

            if(scorePageCollection && scorePageCollection.playerScores.length > 0) {

                logger.info(`Page ${nextFetchPage} of historic scores loaded.`)

                await PlayerScoreSaver.saveHistoricScorePageForPlayer(player, allPlayerScoreIds, scorePageCollection)

                player.lastHistoryFetchPage = nextFetchPage
                await player.save()
                nextFetchPage += 1
            } else { // end page reached
                if(process.env.DEBUG == "true") {
                    logger.info(`Finished loading historic scores for ScoreSaber player ${player.name} (id ${player.id})`)
                }
                endPageReached = true
                player.fetchedAllScoreHistory = true
                await player.save()
            }

        }

        

    }
    
    
}