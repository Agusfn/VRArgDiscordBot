import { Model } from "sequelize"


export class PlayerScore extends Model {

    id: number
    playerId: number
    leaderboardId: number
    rank: number
    baseScore: number
    modifiedScore: number
    pp: number
    weight: number
    modifiers: string
    multiplier: number
    badCuts: number
    missedNotes: number
    maxCombo: number
    fullCombo: boolean
    timeSet: Date

}


