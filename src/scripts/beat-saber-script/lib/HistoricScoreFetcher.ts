import logger from "@utils/logger"
import { SSAccount } from "../model/index"
import { ScoreSaberAPI } from "../utils/index"

export default class HistoricScoreFetcher {
    
    private static fetchRunning: boolean = false
    private static waitingForRetry: boolean
    private static playerFetchQueue: SSAccount[]


    /**
     * 
     * @param ssPlayerId 
     */
    public static async startPlayerFetch(ssPlayerId?: string) {
        
        if(!this.playerFetchQueue.find(player => player.id == ssPlayerId)) {
            const player = await SSAccount.findByPk(ssPlayerId)
            if(player) {
                this.playerFetchQueue.push(player)
            } else {
                logger.warn(`Player id ${ssPlayerId} was not found.`)
            }
        }

        if(!this.fetchRunning) {
            this.runFetcher()
        }

    }


    /**
     * 
     * @returns 
     */
    public static restartFetching() {

        if(this.fetchRunning) {
            // debug log
            return
        }

        this.runFetcher()
    }


    /**
     * start fetching user by user historic score in user fetch queue
     */
    private static runFetcher() {

        if(this.fetchRunning && !this.waitingForRetry) return

        this.fetchRunning = true
        if(this.waitingForRetry) {
            this.waitingForRetry = false
        }

        while(this.playerFetchQueue.length > 0) {
            try {
                const player = this.playerFetchQueue[0]
                this.fetchHistoricScoresForPlayer(player)
                this.playerFetchQueue.shift()
            } catch(error) {
                // if max retries
                    // set waitingForRetry true
                    // set timer in X seconds to re-run
                // if other error
                    // log and break excecution
                    
            }
        }

        this.fetchRunning = false

    }



    private static fetchHistoricScoresForPlayer(player: SSAccount) {

        // check last fetched page
        // fetch next page
        // save said page of scores


    }
    
    
}