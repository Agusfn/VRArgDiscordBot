import { LeaderboardInfo, PlayerScoreCollection, PlayerScore as PlayerScoreAPI } from "../utils/index"
import { SSPlayer, Leaderboard, PlayerScore } from "../model/index"
import { LeaderboardI, PlayerScoreI } from "../ts"
import { ScoreSaberDataCache } from "./ScoreSaberDataCache"
import logger from "@utils/logger"
import { roundNumber } from "@utils/index"


/**
 * Class that handles the saving of player scores and the related leaderboards (song maps) into the database.
 */
export class PlayerScoreSaver {
    

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
            if(!ScoreSaberDataCache.leaderboardExists(score.leaderboard.id)) {
                const newLeaderboard: LeaderboardI = this.makeLeaderboardFromApiLeaderBoard(score.leaderboard)
                leaderboardsToSave.push(newLeaderboard)
                ScoreSaberDataCache.addLeaderboardId(score.leaderboard.id)
            }

            // Save player score, given it's not already present in DB (ids held in allPlayerScoreIds)
            if(!allPlayerScoreIds.includes(score.score.id)) {
                const newScore: PlayerScoreI = this.makePlayerScoreFromApiScore(score, player.id)
                scoresToSave.push(newScore)
                allPlayerScoreIds.push(score.score.id)
            }
        }

        await Leaderboard.bulkCreate(leaderboardsToSave)
        await PlayerScore.bulkCreate(scoresToSave)

        if(process.env.DEBUG == "true") {
            logger.info("Bulk saved " + leaderboardsToSave.length + " new leaderboards (maps)")
            logger.info("Bulk saved " + scoresToSave.length + " new scores")
        }


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
            createdDate: new Date(leaderboard.createdDate),
            rankedDate: leaderboard.rankedDate ? new Date(leaderboard.rankedDate) : null,
            qualifiedDate: leaderboard.qualifiedDate ? new Date(leaderboard.qualifiedDate) : null,
            ranked: leaderboard.ranked,
            stars: leaderboard.stars,
            coverImage: leaderboard.coverImage
        }
    }

    /**
     * Create a PlayerScore javascript plain object given a PlayerScoreAPI response object, which contains both score and leaderboard (map) information
     * @param apiScore 
     * @param ssPlayerId 
     * @returns 
     */
    private static makePlayerScoreFromApiScore(apiScore: PlayerScoreAPI, ssPlayerId: string): PlayerScoreI {
        const score = apiScore.score

        let accuracy = null
        if(apiScore.leaderboard.maxScore != null && apiScore.leaderboard.maxScore > 0) { // lboard maxScore may be 0 in rare cases
            accuracy = roundNumber((score.modifiedScore / apiScore.leaderboard.maxScore) * 100, 2)
        }

        return {
            id: score.id,
            playerId: ssPlayerId,
            leaderboardId: apiScore.leaderboard.id,
            rank: score.rank,
            baseScore: score.baseScore,
            modifiedScore: score.modifiedScore,
            pp: score.pp,
            accuracy: accuracy,
            weight: roundNumber(score.weight, 8),
            modifiers: score.modifiers,
            multiplier: score.multiplier,
            badCuts: score.badCuts,
            missedNotes: score.missedNotes,
            maxCombo: score.maxCombo,
            fullCombo: score.fullCombo,
            timeSet: new Date(score.timeSet)
        }
    }
 
    
}