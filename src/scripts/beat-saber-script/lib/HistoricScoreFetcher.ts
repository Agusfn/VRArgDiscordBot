import { Op } from "sequelize"
import logger from "@utils/logger"
import { SSAccount, PlayerScore } from "../model/index"
import { ScoreSaberAPI } from "../utils/index"

const SCORES_FETCHED_PER_PAGE = 100


/**
 * Class that handles the fetching of historic scores for ScoreSaber users. 
 * Each time a SSPlayer is registered, all of its historic scores will be fetched sequentially.
 */
export class HistoricScoreFetcher {
    
    private static fetchRunning: boolean = false
    private static playerFetchQueue: SSAccount[] = []


    /**
     * Add a player to the fetch queue and start the fetcher (if not already running)
     * @param ssPlayerId 
     */
    public static async addPlayerToFetchQueue(ssPlayerId: string) {
        
        const ssAccount = await SSAccount.findByPk(ssPlayerId)
        if(!ssAccount) {
            logger.warn(`ScoreSaber player id ${ssPlayerId} was not found in DB.`)
            return
        }
        if(this.playerFetchQueue.find(player => player.id == ssPlayerId)) {
            logger.warn(`ScoreSaber player id ${ssPlayerId} is already present in fetch queue, did not add again.`)
            return
        }

        this.playerFetchQueue.push(ssAccount)

        if(!this.fetchRunning) {
            this.startFetcher() // async
        }

    }

    /**
     * start fetching user by user historic score in user fetch queue
     */
    public static async startFetcher() {

        if(this.fetchRunning) return
        this.fetchRunning = true

        // Load in queue all pending players from DB that are not already in the queue (useful when resuming the fetch after an interruption)
        const playersPendingFetch = await SSAccount.scope("pendingHistoricFetch").findAll()
        playersPendingFetch.forEach(playerInDb => {
            if(!this.playerFetchQueue.find(playerInQueue => playerInQueue.id == playerInDb.id)) {
                this.playerFetchQueue.push(playerInDb)
            }
        })

        await this.processFetchQueue()

        this.fetchRunning = false

    }


    private static async processFetchQueue() {

        while(this.playerFetchQueue.length > 0) {
            try {
                const ssAccount = this.playerFetchQueue[0]
                await this.fetchHistoricScoresForSSPlayer(ssAccount)
                this.playerFetchQueue.shift()
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
     * Fetch all historic scores for a given ScoreSaber player (or SSAccount)
     * @param player 
     */
    private static async fetchHistoricScoresForSSPlayer(player: SSAccount) {

        if(process.env.DEBUG == "true") {
            logger.info(`Starting historic score fetch for ScoreSaber player ${player.name}`)
        }

        // Get an array of all existing player score ids, so we can make sure to add only new scores
        const playerScoreIds = (await PlayerScore.findAll({
            where: { playerId: player.id },
            attributes: ["id"]
        })).map(score => score.id)

        console.log("playerScoreIds", playerScoreIds)

        // check last fetched page
        // fetch next page
        // save said page of scores
        
        let endPageReached = false
        let nextFetchPage = player.lastHistoryFetchPage + 1
        const api = new ScoreSaberAPI()

        let songsLoaded = 0

        while(endPageReached != true) {

            const scoreCollection = await api.getScores(player.id, "recent", nextFetchPage, SCORES_FETCHED_PER_PAGE)

            if(scoreCollection && scoreCollection.playerScores.length > 0) {
                


                if(nextFetchPage % 10 == 0) {
                    logger.info(`Page ${nextFetchPage} of historic scores loaded. New songs loaded in last 10 pages: ${songsLoaded}`)
                    songsLoaded = 0
                }

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