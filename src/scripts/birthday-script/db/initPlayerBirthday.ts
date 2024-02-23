import { DataTypes as Types, Sequelize, Op } from "sequelize"
import { PlayerBirthday } from "../model/PlayerBirthday"
import SequelizeDBManager from "@lib/SequelizeDBManager"
import { User } from "@models/index"

export default () => {

    PlayerBirthday.init({
        birthday: {
            type: Types.DATE,
            primaryKey: true
        },
        discordUserId: {
          type: Types.STRING,
          references: {
              model: User,
              key: "discordUserId"
          }
      },
    }, 
    { 
        sequelize: SequelizeDBManager.getInstance(), 
        modelName: "PlayerBirthday",
        tableName: "player_birthdays",
        scopes: { // query scopes
            /** Query scope to find a player by their discord user id */
            withDiscordUserId(discordUserId: string) {
                return {
                    where: {
                        discordUserId: discordUserId
                    }
                }
            }

        }
    },
    )
}