import { DataTypes as Types, Sequelize, Op } from "sequelize"
import { PlayerBirthday } from "../model/PlayerBirthday"
import SequelizeDBManager from "@lib/SequelizeDBManager"
import { User } from "@models/index"

export default () => {

    PlayerBirthday.init({
        date: {
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
        tableName: "player_birthdays"
    })
}