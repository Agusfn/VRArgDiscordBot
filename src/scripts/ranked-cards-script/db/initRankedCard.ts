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
        tags: {type: Types.TEXT,
            get() {
                const value = this.getDataValue('tags');
                return value ? JSON.parse(value) : null;
            },
            set(value) {
                this.setDataValue('tags', JSON.stringify(value));
            }}, 
        rankedDate: {type: Types.STRING}, 
        userName: {type: Types.STRING}, 
        qualified: {type: Types.BOOLEAN}
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