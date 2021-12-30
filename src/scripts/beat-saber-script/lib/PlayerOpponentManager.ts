import { User } from "../model/index"
import { ScoreSaberAPI } from "../utils/index"

export default class PlayerOpponentManager {
    

    private static playerOpponentPairs: {player1Id: string, player2Id: string}[]

    public static initialize() {
        // load all player opponent pairs
    }


    public static getOpponentsForPlayer(playerId: number): number[] {
        return [0]
    }
  
    public static playerHasOpponent(playerId: number, opponentPlayerId: number) {

    }


    
}