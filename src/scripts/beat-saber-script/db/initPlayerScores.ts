import { DataTypes as Types, Sequelize, Op } from "sequelize"
import { PlayerScore, SSPlayer, Leaderboard } from "../model"
import SequelizeDBManager from "@lib/SequelizeDBManager"

export default () => {

    PlayerScore.init({
        id: {
            type: Types.INTEGER,
            primaryKey: true
        },
        playerId: {
            type: Types.STRING,
            references: {
                model: SSPlayer,
                key: "id"
            }
        },
        leaderboardId: {
            type: Types.INTEGER,
            references: {
                model: Leaderboard,
                key: "id"
            }
        },
        rank: Types.INTEGER,
        baseScore: Types.INTEGER,
        modifiedScore: Types.INTEGER,
        pp: Types.DECIMAL(7, 3),
        accuracy: Types.DECIMAL(4, 2),
        weight: Types.DECIMAL(10, 9),
        modifiers: Types.STRING,
        multiplier: Types.DECIMAL(7, 6),
        badCuts: Types.INTEGER,
        missedNotes: Types.INTEGER,
        maxCombo: Types.INTEGER,
        fullCombo: Types.BOOLEAN,
        timeSet: Types.DATE
    }, 
    {
        sequelize: SequelizeDBManager.getInstance(), 
        modelName: "PlayerScore",
        tableName: "player_scores",
        timestamps: false,
        scopes: {

            // Query scope to retrieve only the top score of a given leaderboardId for each existing SSPlayer, joined with the data of said SSPlayer
            topScoresForEachPlayer(leaderboardId: number, ignoreScoreId: number) {
                return {
                    include: SSPlayer,
                    attributes: {
                        include: [
                            [Sequelize.fn("max", Sequelize.col("modifiedScore")), "playerTopScore"]
                        ],
                    },
                    where: {
                        id: {
                            [Op.ne]: ignoreScoreId
                        },
                        leaderboardId: leaderboardId
                    },
                    group: ["playerId"],
                    raw: true
                }
            }

        }
    })



}