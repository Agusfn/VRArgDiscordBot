import { User } from "@models/index"
import { PlayerBirthday } from "../model/PlayerBirthday"

export default () => {

    User.hasOne(PlayerBirthday, {
        foreignKey: "discordUserId"
    })
    PlayerBirthday.belongsTo(User, {
        foreignKey: "discordUserId"
    })
    
}