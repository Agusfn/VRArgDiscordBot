import { Model } from "sequelize"
import { SSCountries } from "../config"

export class User extends Model {

    public discordUserId: string
    public registeredDate: Date
    public discordUsername: string
    public playerName: string
    public scoreSaberPlayerId: string
    public currentPP: number
    public scoreSaberCountry: string
    public scoreSaberAvatarPath: string
    public globalRank: number
    public countryRank: number
    public avgRankedAccuracy: number
    public fetchedAllScoreHistory: boolean
    public lastHistoryFetchPage: number
    public lastPeriodicStatusCheck: Date

    
}


