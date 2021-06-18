import { User, UserScore, Song } from "../model/index"
import ScoreSaberApi, { ScoreOrder }  from "@lib/ScoreSaberApi"
import { ScoreReply, Score } from "@ts/interfaces"
import { Op } from "sequelize"
import { PLAYER_STATUS_CHECK_INTERVAL_MIN } from "../config"


/**
 * Class to handle and store new user scores periodically.
 */
export class PeriodicPlayerStatusCheck {

    public async continueCheck() {

        const aMomentAgo = new Date((new Date).getTime() - PLAYER_STATUS_CHECK_INTERVAL_MIN * 60 * 1000 )

        const usersPendingCheck = await User.findAll({
            where: { lastPeriodicStatusCheck: { [Op.lte]: aMomentAgo } },
            order: [ ["lastPeriodicStatusCheck", "ASC"] ]
        })
        console.log("usersPendingCheck", usersPendingCheck)

        const ssApi = new ScoreSaberApi()

        for(const user of usersPendingCheck) {

            const player = await ssApi.getPlayer(user.scoreSaberPlayerId)

            user.currentPP = player.playerInfo.pp
            user.globalRank = player.playerInfo.rank
            user.countryRank = player.playerInfo.countryRank
            user.playerName = player.playerInfo.playerName
            user.scoreSaberAvatarPath = player.playerInfo.avatar
            user.avgRankedAccuracy = player.scoreStats.averageRankedAccuracy
            user.lastPeriodicStatusCheck = new Date()

            console.log("Saving player status: ", user.playerName)
            await user.save()
        }
            

    }


    algoritmo() {

        // para cada player del ranking actualizado
            // si el player subió de ranking con respecto a antes:
                // iterar sobre todos los players que están por debajo de él:
                    // si el player antes estaba por encima del primer player:
                        // sumar a array de players qwue fueron superados por el primer player
                // si hay uno o mas players superados por el player:
                    // mandar mensaje picante jeje
            

    }




}