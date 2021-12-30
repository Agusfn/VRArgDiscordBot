import { Player, PlayerScoreCollection } from "./types";
import {IRestResponse, RestClient} from "typed-rest-client/RestClient";


export class ScoreSaberAPI {

    private static readonly HOST: string = 'https://scoresaber.com/api/';

    private readonly restClient: RestClient = new RestClient(null, ScoreSaberAPI.HOST);


    /**
     * Get player profile information
     * @param id 
     * @returns 
     */
    public async getPlayer(id: string): Promise<Player> {
        const response: IRestResponse<Player> = await this.restClient.get<Player>(`player/${id}/full`);
        return this.processRequestResponse(response)
    }


    /**
     * Gets scores by playerId
     * @param playerId 
     * @param order 
     * @param page 1 or above
     * @param limit Max is 100
     * @returns 
     */
    public async getScores(playerId: string, order: "top" | "recent", page: number, limit: number): Promise<PlayerScoreCollection> {
        
        let response: IRestResponse<PlayerScoreCollection>
        response = await this.restClient.get<PlayerScoreCollection>(`player/${playerId}/scores?sort=${order}&page=${page}&limit=${limit}`)
        
        return this.processRequestResponse(response)
    }


    /**
     * Return the requested object or null if not found, or throw an exception if request was not successful.
     * @param response 
     * @returns 
     */
    private processRequestResponse<T>(response: IRestResponse<T>): T {

        if(response.statusCode >= 200 && response.statusCode <= 299) {
            return response.result
        } else if(response.statusCode == 404) {
            return null // null if no results
        } else {
            throw response // all other errors not thrown by rest client
        }

    }


}
