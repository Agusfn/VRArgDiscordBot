import { Model } from "sequelize"


export class Leaderboard extends Model {

    /** ScoreSaber leaderboard id */
    public id: number
    public songHash: string
    public songName: string
    public songSubName: string
    public songAuthorName: string
    public levelAuthorName: string
    public difficultyNumber: number
    public difficultyName: string
    /** The maximum score that can be achieved with 100% acc */
    public maxScore: number
    public createdDate: Date
    public rankedDate?: Date
    public qualifiedDate?: Date
    public ranked: boolean
    public stars: number
    public coverImage: string

}


