import { User } from "../model/index"
import { ScoreSaberAPI } from "../utils/index"

export default class PlayerScoreSaver {
    

    private static leaderboardIds: string[]


    public static initialize() {
        // load ids of all leaderboards into leaderboardIds
    }


    public static saveHistoricScorePageForPlayer(player: any, page: any) {

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

 
    
}