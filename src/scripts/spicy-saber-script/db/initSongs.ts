import { DataTypes as Types } from "sequelize"
import { Song, UserScore } from "../model"
import Sequelize from "@utils/Sequelize"

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
        sequelize: Sequelize.getInstance(), 
        modelName: "Song",
        tableName: "songs",
        timestamps: false
    })

}