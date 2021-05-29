import { Model } from "sequelize"


export class UserScore extends Model {

    scoreId: string
    date: Date
    discordUserId: string
    songHash: string
    globalRank: number
    score: number
    pp: number
    weight: number

}


