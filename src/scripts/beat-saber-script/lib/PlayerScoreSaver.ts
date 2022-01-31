import { SSAccount, Leaderboard, PlayerScore } from "../model/index"
import { LeaderboardI, PlayerScoreI } from "../ts"
import { LeaderboardInfo, PlayerScoreCollection, Score, ScoreSaberAPI } from "../utils/index"


export class PlayerScoreSaver {
    

    /**
     * Array that contains all of the currently existing Leaderboards in the database. 
     * It's useful for checking the existence of leaderboards without having to make DB queries.
     */
    private static allLeaderboardIds: number[]


    public static async initialize() {
        // load ids of all leaderboards into leaderboardIds
    }


    /**
     * Store a page of scores for a given ScoreSaber account, and store any map (Leaderboard) that was not previously stored.
     * @param player 
     * @param allPlayerScoreIds Array that contains all the user current stored score ids. Is used to avoid storing repeated scores.
     * @param scoreCollection 
     */
    public static async saveHistoricScorePageForPlayer(player: SSAccount, allPlayerScoreIds: number[], scoreCollection: PlayerScoreCollection) {

        // plain objects to bulk create for each page
        const leaderboardToSave: LeaderboardI[] = []
        const scoresToSave: PlayerScoreI[] = []
        
        for(const score of scoreCollection.playerScores) {

            // Ignore already existing Leaderboards (maps)
            if(!this.allLeaderboardIds.includes(score.leaderboard.id)) {
                this.allLeaderboardIds.push(score.leaderboard.id)
                leaderboardToSave.push(this.makeLeaderboardFromApiLeaderBoard(score.leaderboard))
            }

            if(!allPlayerScoreIds.includes(score.score.id)) { // user doesn't have this score registered
                allPlayerScoreIds.push(score.score.id)
                scoresToSave.push(this.makePlayerScoreFromApiScore(score.score, player.discordUserId))
            }
        }

        //songsLoaded += leaderboardToSave.length
        await Leaderboard.bulkCreate(leaderboardToSave)
        await PlayerScore.bulkCreate(scoresToSave)

        // for each score in page
        this.saveNewMapIfDoesntExist(null)
        this.savePlayerScore(null)

    }



    public static saveNewScoreForPlayer(player: any, score: any) {

        this.savePlayerScore(score)
        


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