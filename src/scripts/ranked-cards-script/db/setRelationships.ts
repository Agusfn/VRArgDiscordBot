import { User } from "@models/index"
import { RankedCard } from "../model/RankedCard"

export default () => {

    User.hasOne(RankedCard, {
        foreignKey: "discordUserId"
    })
    RankedCard.belongsTo(User, {
        foreignKey: "discordUserId"
    })
    
}