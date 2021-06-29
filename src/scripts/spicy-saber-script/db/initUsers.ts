import { DataTypes as Types } from "sequelize"
import { User, UserScore } from "../model"
import Sequelize from "@utils/Sequelize"

export default () => {

    User.init({
        discordUserId: {
            type: Types.STRING,
            primaryKey: true
        },
        registeredDate: Types.DATE,
        discordUsername: Types.STRING,
        playerName: Types.STRING,
        scoreSaberPlayerId: Types.STRING,
        currentPP: Types.DECIMAL(7, 2),
        scoreSaberCountry: Types.STRING,
        scoreSaberAvatarPath: Types.STRING,
        globalRank: Types.INTEGER,
        countryRank: Types.INTEGER,
        avgRankedAccuracy: Types.DECIMAL(5, 3),
        fetchedAllScoreHistory: {
            type: Types.BOOLEAN,
            defaultValue: false
        },
        lastHistoryFetchPage: {
            type: Types.INTEGER,
            defaultValue: 0
        },
        lastPeriodicStatusCheck: Types.DATE,
        announcementsEnabled: {
            type: Types.BOOLEAN,
            defaultValue: true
        }
    }, 
    { 
        sequelize: Sequelize.getInstance(), 
        modelName: "User",
        tableName: "users"
    })

}