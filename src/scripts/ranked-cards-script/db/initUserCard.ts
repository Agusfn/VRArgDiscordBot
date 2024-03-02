import { DataTypes as Types, Sequelize, Op } from "sequelize"
import { UserCard } from "../model/UserCard"
import SequelizeDBManager from "@lib/SequelizeDBManager"
import { User } from "@models/index"

export default () => {

    UserCard.init({
        id: {
            type: Types.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        discordUserId: {
            type: Types.STRING,
            references: {
                model: User,
                key: "discordUserId"
            }
        },
        lastDraw: {
            type: Types.DATE
        },
        money: {
            type: Types.INTEGER,
            defaultValue: 0
        }
    }, { 
        sequelize: SequelizeDBManager.getInstance(), 
        modelName: "UserCard",
        tableName: "rankedcards_users",
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
    });
}