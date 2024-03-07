import { DataTypes, InferAttributes, InferCreationAttributes, Model, Op, Sequelize } from "sequelize"
import { SSPlayer } from "./SSPlayer"
import { Leaderboard } from "./Leaderboard"
import sequelize from "@core/sequelize"



/**
 * A ScoreSaber individual score submitted by a single player in a given time for a given Leaderboard (song map).
 * Multiple scores of the same player for a same Leaderboard (increasing score) are stored in DB, unlike ScoreSaber does.
 */
export class PlayerScore extends Model<InferAttributes<PlayerScore>, InferCreationAttributes<PlayerScore>> {
    
    /** Internal id to identify score. Does not reflect any id in ScoreSaber API. Differs from ssId because there may be multiple scores of a player in a given map. */
    id: number
    /** Id of score in ScoreSaber. In ScoreSaber, each player may only have 1 score per map, subsequent submits are improvements of said score. */
    ssId: number
    /** Id of ScoreSaber player (FK with SSPlayer) */
    playerId: string
    /** If of played leaderboard/map (FK with Leaderboard) */
    leaderboardId: number
    /** World rank set for this score at the time of submitting it (may get outdated quickly) */
    rank: number
    /** Base score subject to modifiers multiplier. */
    baseScore: number
    /** Modified and final score. This determines the accuracy of the score. In most cases it's the same as baseScore since modifiers are not used. */
    modifiedScore: number
    /** Total unweighted pp scored (not the contributed pp). */
    pp: number
    /** Percentage of modified score against max score for this leaderboard. */
    accuracy: number
    /** Weight for pp contribution for this score at the time of setting it (may get outdated quickly) */
    weight: number
    /** Modifiers CSV list. Example: "DA,FS" */
    modifiers: string
    /** Multiplier of score for the given modifiers. Without modifiers it is 1. */
    multiplier: number
    /** Old scores may have this value as zero. */
    badCuts: number
    /** Old scores may have this value as zero. */
    missedNotes: number
    /** Old scores may have this value as zero. */
    maxCombo: number
    /** In old scores this may be false. */
    fullCombo: boolean
    /** Date and time in which this score was set. */
    timeSet: Date

    /** For eager loading from sequelize */
    declare readonly SSPlayer?: SSPlayer
    declare readonly Leaderboard?: Leaderboard

}


PlayerScore.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ssId: DataTypes.INTEGER,
    playerId: {
        type: DataTypes.STRING,
        references: {
            model: SSPlayer,
            key: "id"
        }
    },
    leaderboardId: {
        type: DataTypes.INTEGER,
        references: {
            model: Leaderboard,
            key: "id"
        }
    },
    rank: DataTypes.INTEGER,
    baseScore: DataTypes.INTEGER,
    modifiedScore: DataTypes.INTEGER,
    pp: DataTypes.DECIMAL(7, 3),
    accuracy: DataTypes.DECIMAL(4, 2),
    weight: DataTypes.DECIMAL(10, 9),
    modifiers: DataTypes.STRING,
    multiplier: DataTypes.DECIMAL(7, 6),
    badCuts: DataTypes.INTEGER,
    missedNotes: DataTypes.INTEGER,
    maxCombo: DataTypes.INTEGER,
    fullCombo: DataTypes.BOOLEAN,
    timeSet: DataTypes.DATE
}, 
{
    sequelize: sequelize, 
    modelName: "PlayerScore",
    tableName: "player_scores",
    timestamps: false,
    scopes: {

        // Query scope to retrieve only the top score of a given leaderboardId for each existing SSPlayer, joined with the data of said SSPlayer
        topScoresForEachPlayer(leaderboardId: number, ignoreSSScoreId: number, ignoreSSScoreDate: Date) {
            return {
                include: SSPlayer,
                attributes: {
                    include: [
                        [Sequelize.fn("max", Sequelize.col("modifiedScore")), "playerTopScore"]
                    ],
                },
                where: {
                    leaderboardId: leaderboardId,
                    [Op.not]: { // ignore specified submission
                        ssId: ignoreSSScoreId,
                        timeSet: ignoreSSScoreDate 
                    }
                },
                group: ["playerId"]
            }
        },
        // Scope to retrieve only the most recent scores for a given player.
        // recentScoresForPlayer(ssPlayerId: string) {
        //     return {
        //         attributes: {
        //             include: [
        //                 [Sequelize.fn("max", Sequelize.col("timeSet")), "recentSubmissionDate"]
        //             ],
        //         },
        //         where: {
        //             playerId: ssPlayerId
        //         },
        //         group: ["ssId"]
        //     }
        // }
        /** Query scope to retrieve the N ranked scores with LEAST accuracy for a given player. */
        leastAccuracy(ssPlayerId: string, limit: number) {
            return {
                include: Leaderboard,
                /*attributes: {
                    include: [
                        [Sequelize.fn("max", Sequelize.col("accuracy")), "maxAccuracy"]
                    ],
                },*/
                where: {
                    playerId: ssPlayerId,
                    [Op.not]: {
                        pp: 0 // if pp != 0 => it's ranked
                    }
                },
                group: ["leaderboardId"],
                order: [
                    [Sequelize.fn('max', Sequelize.col('accuracy')), 'ASC'],
                ],
                limit: limit
            }
        }
    }
})



Leaderboard.hasMany(PlayerScore, {
    foreignKey: "leaderboardId"
})
PlayerScore.belongsTo(Leaderboard, {
    foreignKey: "leaderboardId"
})

SSPlayer.hasMany(PlayerScore, {
    foreignKey: "playerId"
})
PlayerScore.belongsTo(SSPlayer, {
    foreignKey: "playerId"
})