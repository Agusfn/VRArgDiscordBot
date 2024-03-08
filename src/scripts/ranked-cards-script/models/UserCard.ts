import { DataTypes as Types, InferAttributes, InferCreationAttributes, Model, Op, Sequelize } from "sequelize"
import { RankedCard } from "./RankedCard"
import sequelize from "@core/sequelize"
import { User } from "@scripts/core-script/models/User"

export class UserCard extends Model<InferAttributes<UserCard>, InferCreationAttributes<UserCard>> { 
    id: number
    discordUserId: string
    lastDraw: Date
    money: number
}

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
    sequelize: sequelize, 
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

UserCard.hasMany(RankedCard, {
    foreignKey: "userCardId"
})