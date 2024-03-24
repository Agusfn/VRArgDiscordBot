import { DataTypes as Types, InferAttributes, InferCreationAttributes, Model } from "sequelize"
import sequelize from "@core/sequelize"
import { UserCard } from "./UserCard"
import { RankedCard } from "./RankedCard"

export class UserDeck extends Model<InferAttributes<UserDeck>, InferCreationAttributes<UserDeck>> { 
    id: number
    userId: number
    cardId: number
    slot: number
}

UserDeck.init({
    id: {
        type: Types.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: Types.INTEGER,
        allowNull: false,
        references: { model: UserCard, key: 'id' },
    },
    cardId: {
        type: Types.INTEGER,
        allowNull: false,
        references: { model: RankedCard, key: 'id' },
    },
    slot: {
        type: Types.INTEGER,
        allowNull: false,
        validate: {
            isIn: [[0, 1, 2, 3, 4, 5, 6, 7, 8]], // Asegura que slot esté entre 0 y 8
        }
    }
}, { 
    sequelize: sequelize, 
    modelName: "UserDeck",
    tableName: "rankedcards_deck"
});