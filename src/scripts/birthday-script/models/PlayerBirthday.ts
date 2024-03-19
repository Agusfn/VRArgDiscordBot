import sequelize from "@core/sequelize"
import { DataTypes as Types, InferAttributes, InferCreationAttributes, Model, Op, Sequelize } from "sequelize"
import { User } from "@scripts/core-script/models/User"

/**
 * A ScoreSaber individual score submitted by a single player in a given time for a given Leaderboard (song map).
 * Multiple scores of the same player for a same Leaderboard (increasing score) are stored in DB, unlike ScoreSaber does.
 */
export class PlayerBirthday extends Model<InferAttributes<PlayerBirthday>, InferCreationAttributes<PlayerBirthday>> { 
  id: number
  discordUserId: string
  birthday: Date
}

PlayerBirthday.init({
  id: {
      type: Types.INTEGER,
      primaryKey: true,
      autoIncrement: true
  },
  birthday: {
      type: Types.DATE,
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
  sequelize: sequelize, 
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
      },

      getAllBirthdays() {
        return {
            // No hay restricciones de fecha
        }
    }

  }
},
)
