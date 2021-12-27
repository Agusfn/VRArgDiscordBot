import { Player } from "@ts/interfaces"
import { User } from "../model/index"
import ScoreSaberApi from "@lib/ScoreSaberApi"

export default class HistoricScoreFetcher {
    
    private static fetchRunning: boolean = false
    private static waitingForRetry: boolean
    private static playerFetchQueue: object[]


    
    public static startPlayerFetch(ssPlayerId?: number) {

        // if player not already present in list
            // get player from db 
            // push to player fetch queue

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
                // get first element
                this.fetchHistoricScoresForPlayer(null)
                // remove user from playerFetchQueue
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



    private static fetchHistoricScoresForPlayer(player: any) {

        // check last fetched page
        // fetch next page
        // save said page of scores


    }
    
    
}