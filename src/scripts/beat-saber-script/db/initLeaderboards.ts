import { DataTypes as Types } from "sequelize"
import { Leaderboard } from "../model"
import SequelizeDBManager from "@lib/SequelizeDBManager"

export default () => {

    Leaderboard.init({
        id: {
            type: Types.INTEGER,
            primaryKey: true
        },
        songHash: Types.STRING,
        songName: Types.STRING,
        songSubName: Types.STRING,
        songAuthorName: Types.STRING,
        levelAuthorName: Types.STRING,
        difficultyNumber: Types.INTEGER,
        difficultyName: Types.STRING,
        maxScore: Types.INTEGER,
        createdDate: Types.DATE,
        rankedDate: Types.DATE,
        qualifiedDate: Types.DATE,
        ranked: Types.BOOLEAN,
        qualified: Types.BOOLEAN,
        stars: Types.DECIMAL(4, 2),
        coverImage: Types.STRING
    }, 
    { 
        sequelize: SequelizeDBManager.getInstance(), 
        modelName: "Leaderboard",
        tableName: "leaderboards",
        timestamps: false
    })

}