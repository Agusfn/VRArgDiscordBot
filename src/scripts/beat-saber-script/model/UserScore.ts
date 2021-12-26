import { Model } from "sequelize"


export class UserScore extends Model {

    scoreId: number
    date: Date
    discordUserId: string
    songHash: string
    globalRank: number
    score: number
    pp: number
    weight: number

}


