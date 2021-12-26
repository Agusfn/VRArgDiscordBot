import { DataTypes as Types } from "sequelize"
import { UserScore, User, Song } from "../model"
import SequelizeDBManager from "@lib/SequelizeDBManager"

export default () => {

    UserScore.init({
        scoreId: {
            type: Types.INTEGER,
            primaryKey: true
        },
        date: Types.DATE,
        discordUserId: { // foreign key of "users" table
            type: Types.STRING,
            references: {
                model: User,
                key: "discordUserId"
            }
        },
        songHash: { // foreign key of "songs" table
            type: Types.STRING,
            references: {
                model: Song,
                key: "songHash"
            }
        },
        globalRank: Types.INTEGER,
        score: Types.INTEGER,
        pp: Types.DECIMAL(7, 2),
        weight: Types.DECIMAL(10, 9)
    }, 
    {
        sequelize: SequelizeDBManager.getInstance(), 
        modelName: "UserScore",
        tableName: "user_scores",
        timestamps: false
    })



}