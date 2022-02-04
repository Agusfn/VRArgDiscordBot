import { Model } from "sequelize"
import { LeaderboardI } from "../ts";


/**
 * A specific map on a specific difficulty for a given song. Contains song info, mapper, max score, and other data.
 * Many Leaderboards may exist for a same song if it has multiple difficulties.
 */
export class Leaderboard extends Model {


}


export interface Leaderboard extends LeaderboardI { }
