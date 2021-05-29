import { User, UserScore, Song } from "../model"

export default () => {

    User.hasMany(UserScore, {
        foreignKey: "discordUserId"
    })
    UserScore.belongsTo(User, {
        foreignKey: "discordUserId"
    })

    Song.hasMany(UserScore, {
        foreignKey: "songHash"
    })
    UserScore.belongsTo(Song, {
        foreignKey: "songHash"
    })
    
}