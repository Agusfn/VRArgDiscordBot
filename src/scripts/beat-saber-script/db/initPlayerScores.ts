import { DataTypes as Types } from "sequelize"
import { PlayerScore, SSAccount, Leaderboard } from "../model"
import SequelizeDBManager from "@lib/SequelizeDBManager"

export default () => {

    PlayerScore.init({
        id: {
            type: Types.INTEGER,
            primaryKey: true
        },
        playerId: {
            type: Types.INTEGER,
            references: {
                model: SSAccount,
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
        weight: Types.DECIMAL(10, 9),
        modifiers: Types.STRING,
        multiplier: Types.DECIMAL(7, 6),
        badCuts: Types.INTEGER,
        missedNoted: Types.INTEGER,
        maxCombo: Types.INTEGER,
        fullCombo: Types.BOOLEAN,
        timeSet: Types.DATE
    }, 
    {
        sequelize: SequelizeDBManager.getInstance(), 
        modelName: "PlayerScore",
        tableName: "player_scores",
        timestamps: false
    })



}