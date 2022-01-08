import { User } from "@models/index"
import { SSAccount, PlayerScore, Leaderboard } from "../model"

export default () => {

    User.hasOne(SSAccount, {
        foreignKey: "discordUserId"
    })
    SSAccount.belongsTo(User, {
        foreignKey: "discordUserId"
    })

    SSAccount.hasMany(PlayerScore, {
        foreignKey: "playerId"
    })
    PlayerScore.belongsTo(SSAccount, {
        foreignKey: "playerId"
    })

    Leaderboard.hasMany(PlayerScore, {
        foreignKey: "leaderboardId"
    })
    PlayerScore.belongsTo(Leaderboard, {
        foreignKey: "leaderboardId"
    })
    
}