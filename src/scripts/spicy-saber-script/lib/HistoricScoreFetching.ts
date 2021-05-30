import { User, UserScore } from "../model/index"
import ScoreSaberApi, { ScoreOrder }  from "@lib/ScoreSaberApi"
import { ScoreReply } from "@ts/interfaces"


/**
 * Class to handle historic score fetching for new users. Doesn't take care of fetching new scores, only scores from the moment they register, to the past.
 */
export default class UserHistoricFetching {

    
    public static async continueFetch() {

        const usersPending = await User.findAll({
            where: { fetchedAllScoreHistory: false }
        })

        for(let user of usersPending) {

            // Obtener un array con todos sus scoreIds registrados
            const scoreIds = <number[]><unknown>(await UserScore.findAll({
                where: { discordUserId: user.discordUserId },
                attributes: ["scoreId"]
            }))

            console.log("user: ", user.scoreSaberPlayerId, "scoreIds", scoreIds)

            let endPageReached = false
            let nextFetchPage = user.lastFetchPage + 1

            while(!endPageReached) {

                const api = new ScoreSaberApi()
                const userScores = await api.getScores(user.scoreSaberPlayerId, ScoreOrder.RECENT, nextFetchPage)
                // to-do: Si no se pudo fetchear por max attempts, breakear todo el fetcher, y esperar al próximo cron.
                
                if(userScores.scores.length > 0) {
                    
                    console.log(userScores)
    
                    for(let score of userScores.scores) {
                        if(!scoreIds.includes(score.scoreId)) {
                            
                            // To-do: add song first because there is constraint fail otherwise and it won't log for some fuckin reason

                            /*const scoreEntity = await UserScore.create({
                                scoreId: score.scoreId,
                                //date: new Date(score.timeSet),
                                discordUserId: user.discordUserId,
                                songHash: score.songHash,
                                globalRank: score.rank,
                                score: score.score,
                                //pp: score.pp,
                                //weight: score.weight
                            })*/

                            const scoreEntity = await UserScore.create({
                                scoreId: 12131,
                                date: new Date(),
                                discordUserId: "userid",
                                songHash: "asdasd",
                                globalRank: 1000,
                                score: 546875,
                                pp: 123.45,
                                weight: 0.888
                            })

                            console.log("saved score", scoreEntity.toJSON())
                            
                            scoreIds.push(score.scoreId)

                        }
                    }
    
                    user.lastFetchPage = nextFetchPage
                    await user.save()
                    nextFetchPage += 1
    
                } else { // end page reached
                    user.fetchedAllScoreHistory = true
                    await user.save()
                }

            }

                
        }

    }


}