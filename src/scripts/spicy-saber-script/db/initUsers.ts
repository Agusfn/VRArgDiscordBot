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
        avgRankedAccuracy: Types.DECIMAL(5, 3)
    }, 
    { 
        sequelize: Sequelize.getInstance(), 
        modelName: "User",
        tableName: "users"
    })

}