import { Model } from "sequelize"
import { SSCountries } from "../config"
import { SSPlayerI, PlayerPerformanceInfo } from "../ts"
import moment from "moment"
import { Player } from "../utils/index"

/**
 * A ScoreSaber account. It is equivalent to the Player in terms of ScoreSaber API.
 */
export class SSPlayer extends Model {


    public getPerformanceInfo(): PlayerPerformanceInfo {
        return {
            playerId: this.id,
            playerName: this.name,
            discordUserId: this.discordUserId,
            rank: this.rank,
            countryRank: this.countryRank,
            avgAccuracy: this.avgRankedAccuracy,
            milestoneAnnouncements: this.milestoneAnnouncements
        }
    }


    /*public lastStatusCheck() {
        return moment(this.lastPeriodicStatusCheck)
    }*/


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


    public scoreSaberURL() {
        return "https://scoresaber.com/u/"+this.id
    }

}


export interface SSPlayer extends SSPlayerI { }

