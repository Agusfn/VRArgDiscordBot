import { LeaderboardInfo, PlayerScoreCollection, PlayerScore as PlayerScoreAPI, Score, ScoreSaberAPI } from "../utils/index"
import { SSPlayer, Leaderboard, PlayerScore } from "../model/index"
import { LeaderboardI, PlayerScoreI } from "../ts"
import logger from "@utils/logger"


/**
 * Class that handles the saving of player scores and the related leaderboards (song maps) into the database.
 */
export class PlayerScoreSaver {
    

    private static initialized = false

    /**
     * Array that contains all of the currently existing Leaderboards in the database. 
     * It's useful for checking the existence of leaderboards without having to make DB queries.
     */
    private static allLeaderboardIds: number[]


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
        }
    }

    
    /**
     * Store a page of scores taken from SS API for a given SSPlayer, and store any Leaderboard (song map) that was not previously stored.
     * @param player The ScoreSaber Player
     * @param allPlayerScoreIds Array that contains all the user current stored score ids. Is used to avoid storing repeated scores.
     * @param scoreCollection Collection of scores from ScoreSaber API for a given page
     */
    public static async saveHistoricScorePageForPlayer(player: SSPlayer, allPlayerScoreIds: number[], scoreCollection: PlayerScoreCollection) {

        // We will bulk save the PlayerScores and Leaderboards unlike with periodic fetching, since historic fetching saves scores and maps in a larger scale
        const leaderboardsToSave: LeaderboardI[] = []
        const scoresToSave: PlayerScoreI[] = []
        
        for(const score of scoreCollection.playerScores) {

            // Save new Leaderboards (song map info) associated with the score
            if(!this.allLeaderboardIds.includes(score.leaderboard.id)) {
                const newLeaderboard: LeaderboardI = this.makeLeaderboardFromApiLeaderBoard(score.leaderboard)
                leaderboardsToSave.push(newLeaderboard)
                this.allLeaderboardIds.push(score.leaderboard.id)
            }

            // Save player score, given it's not already present in DB (ids held in allPlayerScoreIds)
            if(!allPlayerScoreIds.includes(score.score.id)) {
                const newScore: PlayerScoreI = this.makePlayerScoreFromApiScore(score.score, player.discordUserId)
                scoresToSave.push(newScore)
                allPlayerScoreIds.push(score.score.id)
            }
        }

        await Leaderboard.bulkCreate(leaderboardsToSave)
        logger.info("Bulk created " + leaderboardsToSave.length + " leaderboards")
        await PlayerScore.bulkCreate(scoresToSave)
        logger.info("bulk created " + scoresToSave.length + " scores")
    }


    /**
     * Given a new score submitted by a player
     * @param player 
     * @param score 
     */
    public static saveNewScoreForPlayer(player: SSPlayer, score: PlayerScoreAPI) {

        

        //this.savePlayerScore(score)
        


    }



    private static savePlayerScore(score: any) {
        // create PlayerScore and save
    }


    private static saveNewMapIfDoesntExist(leaderboard: any) {

        // if in leaderboardIds map exists
            // return

        // create new leaderboard and save

    }

    /**
     * Make a plain object for a Leaderboard from the Leaderboard data from the API.
     * @param score 
     * @returns 
     */
    private static makeLeaderboardFromApiLeaderBoard(leaderboard: LeaderboardInfo): LeaderboardI {
        return {
            id: leaderboard.id,
            songHash: leaderboard.songHash,
            songName: leaderboard.songName,
            songSubName: leaderboard.songSubName,
            songAuthorName: leaderboard.songAuthorName,
            levelAuthorName: leaderboard.levelAuthorName,
            difficultyNumber: leaderboard.difficulty.difficulty,
            difficultyName: leaderboard.difficulty.difficultyRaw,
            maxScore: leaderboard.maxScore,
            ranked: leaderboard.ranked,
            stars: leaderboard.stars,
            createdDate: leaderboard.createdDate
        }
    }

    private static makePlayerScoreFromApiScore(score: Score, discordUserId: string): PlayerScoreI {
        return {
            scoreId: score.scoreId,
            date: new Date(score.timeSet),
            discordUserId: discordUserId,
            songHash: score.songHash,
            globalRank: score.rank,
            score: score.score,
            pp: score.pp,
            weight: score.weight
        }
    }
 
    
}