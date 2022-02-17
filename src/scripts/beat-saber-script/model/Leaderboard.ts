import { Model } from "sequelize"
import { LeaderboardI } from "../ts";


/**
 * A specific map on a specific difficulty for a given song. Contains song info, mapper, max score, and other data.
 * Many Leaderboards may exist for a same song if it has multiple difficulties.
 */
export class Leaderboard extends Model {


    /**
     * Get a human readable line with the map info of this Leaderboard.
     */
    public readableMapDesc(): string {

        let text

        if(this.songAuthorName) {
            text = "_" + this.songAuthorName + " - " + this.songName + "_"
        } else {
            text = "_"+this.songName+"_"
        }
        
        if(this.levelAuthorName) {
            text += " ("+this.levelAuthorName+")"
        }

        text += " en " + this.readableDifficulty()

        return text
    }


    /**
     * Get difficulty name of this map (Leaderboard in a readable format)
     * @returns 
     */
    public readableDifficulty(): string {
        if(this.difficultyName == "_Easy_SoloStandard") {
            return "Easy"
        } else if(this.difficultyName == "_Normal_SoloStandard") {
            return "Normal"
        } else if(this.difficultyName == "_Hard_SoloStandard") {
            return "Hard"
        } else if(this.difficultyName == "_Expert_SoloStandard") {
            return "Expert"
        } else if(this.difficultyName == "_ExpertPlus_SoloStandard") {
            return "Expert+"
        }
        return "difficulty not defined"
    }

}


export interface Leaderboard extends LeaderboardI { }
