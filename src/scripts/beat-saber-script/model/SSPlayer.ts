import { Model } from "sequelize"
import { SSCountries } from "../config"
import { UserRankInfo } from "../ts"
import moment from "moment"

/**
 * A ScoreSaber Player entity.
 */
export class SSPlayer extends Model {

    /** ScoreSaber player id (may be Steam id) */
    public id: string
    /** Foreign key to identify the bot/Discord User */
    public discordUserId: string
    public registeredDate: Date
    /** User defined setting if they want to gather scores or not */
    public enabled: boolean
    /** ScoreSaber nickname */
    public name: string
    /** Full URL from scoresaber cdn */
    public profilePicture: string
    public country: string
    public pp: number
    /** Global rank */
    public rank: number
    public countryRank: number
    public banned: boolean
    public inactive: boolean
    public totalScore: number
    public totalRankedScore: number
    public avgRankedAccuracy: number
    public totalPlayCount: number
    public rankedPlayCount: number

    public fetchedAllScoreHistory: boolean
    public lastHistoryFetchPage: number
    public lastPeriodicStatusCheck: Date
    public milestoneAnnouncements: boolean
    public updatedDate: Date


    public getRankInfo(): UserRankInfo {
        return {
            discordUserId: this.discordUserId,
            globalRank: this.rank
        }
    }


    public lastStatusCheck() {
        return moment(this.lastPeriodicStatusCheck)
    }


    
}


