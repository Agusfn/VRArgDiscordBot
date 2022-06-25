import { Leaderboard, PlayerScore } from "../model/index"
import logger from "@utils/logger"
import { LeaderboardI } from "../ts"


/**
 * Modules that can fetch data from this cache class
 */
export enum FetcherModule {
    HISTORIC_FETCHER = "historic_fetcher",
    PERIODIC_FETCHER = "periodic_fetcher"
}

/** Many submissions may correspond to a same score. This identifies the submission. */
interface ScoreSubmission {
    ssScoreId: number // ScoreSaber Score ID
    timeSetUnix: number
}


/**
 * An object conaining the score id list for a given player.
 */
interface PlayerScoresCacheItem {
    scoreSubmissions: ScoreSubmission[]
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
    private static existingLeaderboards: {
        leaderboardId: number,
        ranked: boolean
    }[]


    /**
     * Cache of score ids for players by its player id.
     */
    private static playerScores: {[ssPlayerId: string]: PlayerScoresCacheItem} = {}


    /**
     * Initialize this class by loading all of the existing leaderboards ids into the array (to later check if a leaderboard exists or must be saved)
     */
    public static async initialize() {
        if(!this.initialized) {
            this.initialized = true

            // Fetch all leaderboard ids from DB into the array.
            const leaderboards = (await Leaderboard.findAll({
                attributes: ["id", "ranked"]
            }))

            this.existingLeaderboards = leaderboards.map(leaderboard => ({ 
                leaderboardId: leaderboard.id, 
                ranked: leaderboard.ranked 
            }))

            if(process.env.DEBUG == "true") {
                logger.info(`Initialized ScoreSaberDataCache. Loaded ${this.existingLeaderboards.length} leaderboard ids.`)
            }
        }
    }


    /**
     * Check if leaderboard is present in DB by its id
     * @param leaderboardId 
     * @returns 
     */
    public static leaderboardExists(leaderboardId: number) {
        if(!this.existingLeaderboards == null) {
            throw new Error("ScoreSaberDataCache was not initialized and leaderboard ids were not loaded!")
        }
        return this.existingLeaderboards.find(item => item.leaderboardId == leaderboardId) ? true : false
    }


    /**
     * Check if an existing leaderboard has a given rank status (useful for comparing when a leaderboard becomes ranked).
     * @param leaderboardId 
     * @param ranked 
     */
    public static leaderboardHasRankStatus(leaderboardId: number, ranked: boolean) {
        if(!this.existingLeaderboards == null) {
            throw new Error("ScoreSaberDataCache was not initialized and leaderboard ids were not loaded!")
        }
        return this.existingLeaderboards.find(item => item.leaderboardId == leaderboardId && item.ranked == ranked) ? true : false
    }


    /**
     * Update the ranked status of the cache of an existing leaderboard
     * @param leaderboardId 
     * @param ranked 
     */
    public static updateLeaderboardRankStatus(leaderboardId: number, ranked: boolean) {
        if(!this.existingLeaderboards == null) {
            throw new Error("ScoreSaberDataCache was not initialized and leaderboard ids were not loaded!")
        }
        const item = this.existingLeaderboards.find(item => item.leaderboardId == leaderboardId)
        if(item) {
            item.ranked = ranked
        }
    }

    /**
     * Add a Leaderboard id to ids cache
     * @param leaderboardIds 
     */
    public static addLeaderboards(leaderboards: LeaderboardI | LeaderboardI[]) {
        if(!this.existingLeaderboards == null) {
            throw new Error("ScoreSaberDataCache was not initialized!")
        }
        if(Array.isArray(leaderboards)) {
            const items = leaderboards.map(item => ({ leaderboardId: item.id, ranked: item.ranked }))
            this.existingLeaderboards = [...this.existingLeaderboards, ...items]
        } else {
            this.existingLeaderboards.push({ leaderboardId: leaderboards.id, ranked: leaderboards.ranked })
        }
    }


    /**
     * Fetch all player existing score ids with their submission date in a cache (if not already done)
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
            const playerScores = await PlayerScore.findAll({
                where: { playerId: ssPlayerId },
                attributes: ["ssId", "timeSet"]
            })
            
            // Array with all the scores of the user, only one per map (the most recent)
            const scoreIdsAndDates = playerScores.map(score => ({
                ssScoreId: score.ssId,
                timeSetUnix: score.timeSet.getTime()
            }))

            this.playerScores[ssPlayerId] = {
                scoreSubmissions: scoreIdsAndDates,
                accessedBy: [fetcherModule]
            }

            console.log("Fetched scoreId cache for player " + ssPlayerId)
        }

    }


    /**
     * Fetch the scoreIds cache from a given ScoreSaber player. Scores MUST have already been fetched previously.
     * @param ssPlayerId 
     * @param ssScoreId The ScoreSaber Score ID (is one per Leaderboard per player)
     * @param timeSetUnix The time in which the score was set (there may be multiple set)
     * @returns 
     */
    public static playerHasScoreSubmission(ssPlayerId: string, ssScoreId: number, timeSetUnix: number) {
        const scores = this.playerScores[ssPlayerId]
        if(!scores) {
            throw new Error("Scores havent't been loaded for SSPlayer id " + ssPlayerId)
        }
        const scoreInfo = scores.scoreSubmissions.find(submission => submission.ssScoreId == ssScoreId && submission.timeSetUnix == timeSetUnix)
        return scoreInfo != null ? true : false
    }


    /**
     * Push a scoreId to the cache for a given ScoreSaber player. Scores MUST have already been fetched previously.
     * @param ssPlayerId 
     * @param scoreIds 
     * @returns 
     */
     public static pushScoresForPlayer(ssPlayerId: string, scoreSubmissions: ScoreSubmission[]) {
        const scores = this.playerScores[ssPlayerId]
        if(!scores) {
            throw new Error("Scores havent't been loaded for SSPlayer id " + ssPlayerId)
        }
        if(Array.isArray(scoreSubmissions)) {
            scores.scoreSubmissions = [...scores.scoreSubmissions, ...scoreSubmissions]
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