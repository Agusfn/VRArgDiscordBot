import { DataTypes as Types, Sequelize, Op } from "sequelize"
import { RankedCard } from "../model/RankedCard"
import SequelizeDBManager from "@lib/SequelizeDBManager"
import { User } from "@models/index"

export default () => {

    RankedCard.init({
        owner: {
            type: Types.STRING,
            references: {
                model: User,
                key: "discordUserId"
            }
        },
        date: {
            type: Types.DATE,
            primaryKey: true
        },
        value: {
            type: Types.FLOAT,
        },
        image: {
            type: Types.BLOB('medium'),
        },
    }, { 
        sequelize: SequelizeDBManager.getInstance(), 
        modelName: "RankedCard",
        tableName: "ranked_cards",
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