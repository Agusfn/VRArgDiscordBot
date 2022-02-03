import { DataTypes as Types, Op } from "sequelize"
import { User } from "@models/index"
import { SSPlayer } from "../model"
import SequelizeDBManager from "@lib/SequelizeDBManager"

export default () => {

    SSPlayer.init({
        id: {
            type: Types.STRING,
            primaryKey: true
        },
        discordUserId: {
            type: Types.STRING,
            references: {
                model: User,
                key: "discordUserId"
            }
        },
        linkedDate: Types.DATE,
        name: Types.STRING,
        profilePicture: Types.STRING,
        country: Types.STRING,
        pp: Types.DECIMAL(7, 3),
        rank: Types.INTEGER,
        countryRank: Types.INTEGER,
        banned: Types.BOOLEAN,
        inactive: Types.BOOLEAN,
        totalScore: Types.INTEGER,
        totalRankedScore: Types.INTEGER,
        avgRankedAccuracy: Types.DECIMAL(5, 3),
        totalPlayCount: Types.INTEGER,
        rankedPlayCount: Types.INTEGER,
        fetchedAllScoreHistory: {
            type: Types.BOOLEAN,
            defaultValue: false
        },
        lastHistoryFetchPage: {
            type: Types.INTEGER,
            defaultValue: 0
        },
        lastPeriodicStatusCheck: Types.DATE,
        milestoneAnnouncements: {
            type: Types.BOOLEAN,
            defaultValue: true
        }
    }, 
    { 
        sequelize: SequelizeDBManager.getInstance(), 
        modelName: "SSPlayer",
        tableName: "scoresaber_players",
        scopes: { // query scopes

            pendingHistoricFetch: {
                where: {
                    fetchedAllScoreHistory: false,
                    discordUserId: {
                        [Op.ne]: null
                    }
                }
            }

        }
    })

}