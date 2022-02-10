import { Leaderboard, PlayerScore } from "../model/index"
import logger from "@utils/logger"


/**
 * Modules that can fetch data from this cache class
 */
export enum FetcherModule {
    HISTORIC_FETCHER = "historic_fetcher",
    PERIODIC_FETCHER = "periodic_fetcher"
}

interface PlayerScoreItem {
    scoreIds: number[],
    accessedBy: FetcherModule[]
}


/**
 * This class contains a cache of the ids of ScoreSaber models (Players, Leaderboards and Scores) stored in the Database.
 * It is used for quick verification saving additional queries to the database.
 * Contains: All existing Leaderboard ids (persists during all runtime) and Player's score Ids (persist when instructed)
 */
export class ScoreSaberDataCache {


    private static initialized = false

    /**
     * Array that contains all of the currently existing Leaderboards in the database. 
     * It's useful for checking the existence of leaderboards without having to make DB queries.
     */
    private static allLeaderboardIds: number[]


    /**
     * Cache of score ids for players by its player id.
     */
    private static playerScores: {[ssPlayerId: string]: PlayerScoreItem} = {}


    /**
     * Initialize this class by loading all of the existing leaderboards ids into the array (to later check if a leaderboard exists or must be saved)
     */
    public static async initialize() {
        if(!this.initialized) {
            this.initialized = true

            // Fetch all leaderboard ids from DB into the array.
            this.allLeaderboardIds = (await Leaderboard.findAll({
                attributes: ["id"]
            })).map(leaderboard => leaderboard.id)

            if(process.env.DEBUG == "true") {
                logger.info(`Initialized ScoreSaberDataCache. Loaded ${this.allLeaderboardIds.length} leaderboard ids.`)
            }
        }
    }


    /**
     * Check if leaderboard is present in DB by its id
     * @param leaderboardId 
     * @returns 
     */
    public static leaderboardExists(leaderboardId: number) {
        if(!this.allLeaderboardIds == null) {
            throw new Error("ScoreSaberDataCache was not initialized and leaderboard ids were not loaded!")
        }
        return this.allLeaderboardIds.includes(leaderboardId)
    }


    /**
     * Add a Leaderboard id to ids cache
     * @param leaderboardIds 
     */
    public static addLeaderboardIds(leaderboardIds: number | number[]) {
        if(!this.allLeaderboardIds == null) {
            throw new Error("ScoreSaberDataCache was not initialized!")
        }
        if(Array.isArray(leaderboardIds)) {
            this.allLeaderboardIds = [...this.allLeaderboardIds, ...leaderboardIds]
        } else {
            this.allLeaderboardIds.push(leaderboardIds)
        }
    }


    /**
     * Fetch player scores (if not already in cache)
     * @param ssPlayerId 
     * @param accesor 
     */
    public static async fetchPlayerScores(ssPlayerId: string, fetcherModule: FetcherModule) {

        const scores = this.playerScores[ssPlayerId]
        if(scores != null) {
            if(scores.accessedBy.includes(fetcherModule)) {
                logger.warn("Scores have already been loaded for SS Player id " + ssPlayerId + " by module " + fetcherModule + ". Fetching was called two times by same module without finishing its use in the middle.")
            } else {
                scores.accessedBy.push(fetcherModule)
            }
        } else {
            // fetch player scores and create entry for this player
            const playerScoreIds = (await PlayerScore.findAll({
                where: { playerId: ssPlayerId },
                attributes: ["id"]
            })).map(score => score.id)

            this.playerScores[ssPlayerId] = {
                scoreIds: playerScoreIds,
                accessedBy: [fetcherModule]
            }

            console.log("Fetched scoreId cache for player " + ssPlayerId)
        }

    }


    /**
     * Fetch the scoreIds cache from a given ScoreSaber player. Scores MUST have already been fetched previously.
     * @param ssPlayerId 
     * @param scoreId 
     * @returns 
     */
    public static playerHasScoreId(ssPlayerId: string, scoreId: number) {
        const scores = this.playerScores[ssPlayerId]
        if(!scores) {
            throw new Error("Scores havent't been loaded for SSPlayer id " + ssPlayerId)
        }
        return scores.scoreIds.includes(scoreId)
    }


    /**
     * Push a scoreId to the cache for a given ScoreSaber player. Scores MUST have already been fetched previously.
     * @param ssPlayerId 
     * @param scoreIds 
     * @returns 
     */
     public static pushScoresForPlayer(ssPlayerId: string, scoreIds: number | number[]) {
        const scores = this.playerScores[ssPlayerId]
        if(!scores) {
            throw new Error("Scores havent't been loaded for SSPlayer id " + ssPlayerId)
        }
        if(Array.isArray(scoreIds)) {
            scores.scoreIds = [...scores.scoreIds, ...scoreIds]
        } else {
            scores.scoreIds.push(scoreIds)
        }
    }


    /**
     * Finish using the scores of a given player. If no modules are using this data, it will be deleted.
     * @param ssPlayerId 
     * @param fetcherModule 
     */
    public static finishUsingPlayerScores(ssPlayerId: string, fetcherModule: FetcherModule) {

        const scores = this.playerScores[ssPlayerId]

        if(!scores) {
            logger.warn("Scores cache for player " + ssPlayerId + " was not found. Finished using scores for player without having fetched their scores in the first place.")
            return
        }

        if(scores.accessedBy.includes(fetcherModule)) {
            scores.accessedBy = scores.accessedBy.filter(item => item != fetcherModule) // remove fetcher module who accessed this data, from list
        } else {
            logger.warn("Fetcher module " + fetcherModule + " hasn't accessed player id " + ssPlayerId + " scores, but now it's finishing its use.")
        }

        // Delete user score ids cache if no longer being used by any module
        if(scores.accessedBy.length == 0) {
            this.playerScores[ssPlayerId] = null
            console.log("Cleaning scoreId cache for player " + ssPlayerId)
        }
    }




    
}