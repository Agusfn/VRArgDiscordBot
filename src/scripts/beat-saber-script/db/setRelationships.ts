import { User } from "@models/index"
import { SSPlayer, PlayerScore, Leaderboard } from "../model"

export default () => {

    User.hasOne(SSPlayer, {
        foreignKey: "discordUserId"
    })
    SSPlayer.belongsTo(User, {
        foreignKey: "discordUserId"
    })

    SSPlayer.hasMany(PlayerScore, {
        foreignKey: "playerId"
    })
    PlayerScore.belongsTo(SSPlayer, {
        foreignKey: "playerId"
    })

    Leaderboard.hasMany(PlayerScore, {
        foreignKey: "leaderboardId"
    })
    PlayerScore.belongsTo(Leaderboard, {
        foreignKey: "leaderboardId"
    })
    
}