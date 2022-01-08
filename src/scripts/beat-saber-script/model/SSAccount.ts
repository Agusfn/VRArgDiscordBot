import { Model } from "sequelize"
import { SSCountries } from "../config"
import { UserRankInfo } from "../ts"
import moment from "moment"
import { Player } from "../utils/index"

/**
 * A ScoreSaber account. It is equivalent to the Player in terms of ScoreSaber API.
 */
export class SSAccount extends Model {

    /** ScoreSaber player id (may be Steam id) */
    public id: string
    /** Foreign key to identify the bot/Discord User */
    public discordUserId: string
    public linkedDate: Date
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
    // Score:
    public fetchedAllScoreHistory: boolean
    public lastHistoryFetchPage: number
    public lastPeriodicStatusCheck: Date
    public milestoneAnnouncements: boolean

    public createdAt: Date
    public updatedAt: Date


    public getRankInfo(): UserRankInfo {
        return {
            discordUserId: this.discordUserId,
            globalRank: this.rank
        }
    }


    public lastStatusCheck() {
        return moment(this.lastPeriodicStatusCheck)
    }


    /**
     * Fill the params of this ScoreSaber account with the Player data from ScoreSaber API
     * @param player 
     */
    public fillWithSSPlayerData(player: Player) {
        this.set({
            id: player.id,
            name: player.name,
            profilePicture: player.profilePicture,
            country: player.country,
            pp: player.pp,
            rank: player.rank,
            countryRank: player.countryRank,
            banned: player.banned,
            inactive: player.inactive,
            // score:
            totalScore: player.scoreStats.totalScore,
            totalRankedScore: player.scoreStats.totalRankedScore,
            avgRankedAccuracy: player.scoreStats.averageRankedAccuracy,
            totalPlayCount: player.scoreStats.totalPlayCount,
            rankedPlayCount: player.scoreStats.rankedPlayCount
        })
    }


    
}


