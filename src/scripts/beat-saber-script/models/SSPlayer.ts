import { DataTypes, InferAttributes, InferCreationAttributes, Model, Op } from "sequelize"
import * as SSApiTypes from "@services/ScoreSaberAPI/types"
import { User } from "@scripts/core-script/models/User"
import { PlayerPerformanceInfo } from "../types"
import sequelize from "@core/sequelize"
import { PlayerScore } from "./PlayerScore"


/**
 * A ScoreSaber account. It is equivalent to the Player in terms of ScoreSaber API.
 */
export class SSPlayer extends Model<InferAttributes<SSPlayer>, InferCreationAttributes<SSPlayer>> {

    /** ScoreSaber player id (may be Steam id) */
    id: string
    /** Foreign key to identify the bot/Discord User */
    discordUserId: string
    linkedDate: Date
    /** ScoreSaber nickname */
    name: string
    /** Full URL from scoresaber cdn */
    profilePicture: string
    country: string
    pp: number
    /** Global rank */
    rank: number
    countryRank: number
    banned: boolean
    inactive: boolean
    totalScore: number
    totalRankedScore: number
    avgRankedAccuracy: number
    totalPlayCount: number
    rankedPlayCount: number

    /** Whether all historic scores (from the time of registration to past) have been fetched from this player, and they are all saved in DB. */
    fetchedAllScoreHistory: boolean
    /** 
     * The last page that was fetched from score history. Is used only in the process of fetching historic scores to be able to resume fetching after any interruption. 
     * When registering any SSPlayer, their score pages are fetched from 1 (most recent) to N (oldest), ignoring any repeated scores.
     * So if a new page is inserted while in the fetching process, it will only result in fetching two duplicate pages, but the fetcher will still iterate until the last page (n+1).
     * The new pages will be fetched by periodic fetcher.
     */
    lastHistoryFetchPage: number
    /** Last time the new scores of this SS Player were fetched from ScoreSaber API. Is useful to prioritize players in case of limitations of fetching API. */
    lastPeriodicScoreFetch: Date
    /** Whether this player is subscribed for milestone announcements in the milestone announcements channel. */
    milestoneAnnouncements: boolean

    /** For eager loading from sequelize */
    declare readonly User?: User;


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
    public fillWithSSPlayerData(player: SSApiTypes.Player) {
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




SSPlayer.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    discordUserId: {
        type: DataTypes.STRING,
        references: {
            model: User,
            key: "discordUserId"
        }
    },
    linkedDate: DataTypes.DATE,
    name: DataTypes.STRING,
    profilePicture: DataTypes.STRING,
    country: DataTypes.STRING,
    pp: DataTypes.DECIMAL(7, 3),
    rank: DataTypes.INTEGER,
    countryRank: DataTypes.INTEGER,
    banned: DataTypes.BOOLEAN,
    inactive: DataTypes.BOOLEAN,
    totalScore: DataTypes.INTEGER,
    totalRankedScore: DataTypes.INTEGER,
    avgRankedAccuracy: DataTypes.DECIMAL(5, 3),
    totalPlayCount: DataTypes.INTEGER,
    rankedPlayCount: DataTypes.INTEGER,
    fetchedAllScoreHistory: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lastHistoryFetchPage: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lastPeriodicScoreFetch: DataTypes.DATE,
    milestoneAnnouncements: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, 
{ 
    sequelize: sequelize, 
    modelName: "SSPlayer",
    tableName: "scoresaber_players",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    scopes: { // query scopes

        pendingHistoricFetch: { // players which haven't had their historic score fetching finished yet
            where: {
                fetchedAllScoreHistory: false,
                discordUserId: {
                    [Op.ne]: null
                }
            }
        },
        discordAccountLinked: { // players that are linked to a Discord account
            where: {
                discordUserId: {
                    [Op.ne]: null
                }
            }
        },
        /** Query scope to find SS Player with a given discord user id. */
        withDiscordUserId(discordUserId: string) {
            return {
                where: {
                    discordUserId: discordUserId
                }
            }
        }

    }
});



User.hasOne(SSPlayer, {
    foreignKey: "discordUserId"
})
SSPlayer.belongsTo(User, {
    foreignKey: "discordUserId"
})

SSPlayer.hasMany(PlayerScore, {
    foreignKey: "playerId"
})
PlayerScore.belongsTo(SSPlayer, {
    foreignKey: "playerId"
})