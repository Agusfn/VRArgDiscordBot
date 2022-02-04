import { Model } from "sequelize"
import { PlayerScoreI } from "../ts/index"


/**
 * A ScoreSaber individual score submitted by a single player in a given time for a given Leaderboard (song map).
 * Multiple scores of the same player for a same Leaderboard (increasing score) are stored in DB, unlike ScoreSaber does.
 */
export class PlayerScore extends Model {
    

}


export interface PlayerScore extends PlayerScoreI { }

