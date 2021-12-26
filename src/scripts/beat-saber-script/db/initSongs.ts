import { DataTypes as Types } from "sequelize"
import { Song, UserScore } from "../model"
import SequelizeDBManager from "@lib/SequelizeDBManager"

export default () => {

    Song.init({
        songHash: {
            type: Types.STRING,
            primaryKey: true
        },
        songName: Types.STRING,
        songSubName: Types.STRING,
        songAuthorName: Types.STRING,
        levelAuthorName: Types.STRING
    }, 
    { 
        sequelize: SequelizeDBManager.getInstance(), 
        modelName: "Song",
        tableName: "songs",
        timestamps: false
    })

}