import { DataTypes as Types, InferAttributes, InferCreationAttributes, Model, Op, Sequelize } from "sequelize"
import { UserCard } from "./UserCard"
import sequelize from "@core/sequelize"

export class RankedCard extends Model<InferAttributes<RankedCard>, InferCreationAttributes<RankedCard>> { 
    id: number
    userCardId: number
    bsr: string
    hash: string
    date: Date
    songName: string
    songSubName: string
    songAuthorName: string
    levelAuthorName: string
    coverImage: string
    difficulty: number
    stars: number
    curated: boolean
    chroma: boolean
    bpm: number
    nps: number
    njs: number
    upvotes: number
    downvotes: number
    score: number
    tags: string
    rankedDate: string
    userName: string
    qualified: boolean
    shiny: boolean

    declare readonly UserCard?: UserCard
}

RankedCard.init({
    id: {
        type: Types.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userCardId: {
        type: Types.INTEGER,
        references: {
            model: UserCard,
            key: "id"
        }
    },
    bsr: {type: Types.STRING, defaultValue: "0"}, 
    hash: {type: Types.STRING, defaultValue: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"}, 
    date: {type: Types.DATE},
    songName: {type: Types.STRING}, 
    songSubName: {type: Types.STRING}, 
    songAuthorName: {type: Types.STRING}, 
    levelAuthorName: {type: Types.STRING}, 
    coverImage: {type: Types.STRING}, 
    difficulty: {type: Types.FLOAT}, 
    stars: {type: Types.FLOAT}, 
    curated: {type: Types.BOOLEAN}, 
    chroma: {type: Types.BOOLEAN}, 
    bpm: {type: Types.FLOAT}, 
    nps: {type: Types.FLOAT}, 
    njs: {type: Types.FLOAT}, 
    upvotes: {type: Types.INTEGER}, 
    downvotes: {type: Types.INTEGER}, 
    score: {type: Types.FLOAT}, 
    tags: {type: Types.TEXT}, 
    rankedDate: {type: Types.STRING}, 
    userName: {type: Types.STRING}, 
    qualified: {type: Types.BOOLEAN},
    shiny: {type: Types.BOOLEAN}
}, { 
    sequelize: sequelize, 
    modelName: "RankedCard",
    tableName: "rankedcards_cards",
    scopes: { // query scopes
        /** Query scope to find a player by their discord user id */
        withUserCardId(userCardId: number) {
            return {
                where: {
                    userCardId: userCardId
                }
            }
        }

    }
});

RankedCard.belongsTo(UserCard, {
    foreignKey: "userCardId"
})

UserCard.hasMany(RankedCard, {
    foreignKey: "userCardId"
})