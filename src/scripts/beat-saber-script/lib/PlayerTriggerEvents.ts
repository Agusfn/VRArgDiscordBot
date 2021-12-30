import {  } from "../model/index"
import { ScoreSaberAPI } from "../utils/index"



export default class PlayerTriggerEvents {
    

    private static playerGlobalRanks: {playerId: number, rank: number}[]
    private static playerAccuracies: {playerId: number, accuracy: number}[]
    private static subscribedPlayerIds: number[]
    private static playerIdCountries: {playerId: number, country: string}


    public static initialize() {
        // load player global ranks
        // load player accuracies
        // load player subscribed to milestones
        // load players with their countries
    }


    public static onPlayerSubmitNewScore(player: any, score: any) {
        // if score is best among all players (existing at least one). needs db query
            // send top score announcement
        // else if score is best among all players of said country (existing at least once). needs db query, maybe use prior
            // send top score of map in said country announcement
        // else if score is first among all players
            // send announcement of first score in song
        // else if score is "significantly improved" than before score of user
            // send announcement about significant improvement of score

        
        // if player improved score than any of their opponents (use existing query)
            // send announcement for each opponent
    }


    public static onPlayerUpdateAccuracy(player: any, oldAccuracy: number, newAccuracy: number) {
        // if player surpassed any other player subscribed in milestones
            // send acc surpass announcement of said players

        // if player improved acc than any of their opponents (use static var)
            // send announcement of acc surpass for each opponent
    }

    public static onPlayerUpdateGlobalRank(player: any, oldRank: number, newRank: number) {
        // if player surpassed any other player subscribed in milestones
            // send global rank surpass announcement of said players

        // if player improved global rank than any of their opponents (use static var)
            // send announcement of global rank surpass for each opponent
    }

    public static onPlayerUpdateCountryRank(player: any, oldRank: number, newRank: number) {
        // if new rank is 1
            // send new country top1 rank announcement
    }



    
    
}