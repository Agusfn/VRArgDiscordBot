import { User } from "@models/index"
import { RankedCard } from "../model/RankedCard"
import { UserCard } from "../model/UserCard"

export default () => {

    RankedCard.belongsTo(UserCard, {
        foreignKey: "userCardId"
    })
    UserCard.hasMany(RankedCard, {
        foreignKey: "userCardId"
    })
}