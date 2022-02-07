import { SSPlayer } from "../model/index"
import { ScoreSaberAPI } from "../utils/index"
import { SCORES_FETCHED_PER_PAGE } from "../config"



export default class PeriodicScoreFetcher {



    public static async startPeriodicFetch() {

        const playersToFetch = await SSPlayer.scope("discordAccountLinked").findAll()
        const api = new ScoreSaberAPI()

        for(const player of playersToFetch) {

            const fetchingEnded = false

            let pageToFetch = 1 // start from first (most recent) page

            while(fetchingEnded == false) {

                const scoresCollection = await api.getScores(player.id, "recent", pageToFetch, SCORES_FETCHED_PER_PAGE)

                // for each score

                    // if player doesn't have the score
                        // add to queue of fetching
                    
                    // if player already has score
                        // mark ended fetching = true
                        // break

            }

            // bulk create scores
            // bulk create maps

        }



    }

    
}