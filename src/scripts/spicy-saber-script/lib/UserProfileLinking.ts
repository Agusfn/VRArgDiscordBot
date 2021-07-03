import { Player } from "@ts/interfaces"
import { User } from "../model/index"
import ScoreSaberApi from "@lib/ScoreSaberApi"

export default class UserProfileLinking {

    private static errorText: string

    public static getErrorText() { 
        return this.errorText 
    }


    /**
     * Link a discord user with a score saber profile and save it into the database.
     * @param discordUserId 
     * @param discordUsername 
     * @param scoreSaberPlayerId 
     * @returns 
     */
    public static async linkUser(discordUserId: string, discordUsername: string, scoreSaberPlayerId: string): Promise<User> {

        // Chequear que el usuario actual no tenga un scoresaber linkeado
        const currentUser = await User.findByPk(discordUserId)
        if(currentUser != null) {
            this.errorText = `Ya estás vinculado con la cuenta de ScoreSaber ${currentUser.playerName}. Para vincular a otra deberás primero desvincular con /deslinkear.`
            return
        }

        // Chequear que no haya otro usuario con el scoresaber indicado
        const otherUserCount = await User.count({
            where: { scoreSaberPlayerId: scoreSaberPlayerId }
        })
        if(otherUserCount > 0) {
            this.errorText = `Ya existe otro usuario usando ese perfil de scoresaber!`
            return
        }

        // fetch user scoresaber
        const api = new ScoreSaberApi()
        let ssUser: Player
        try {
            ssUser = await api.getPlayer(scoreSaberPlayerId)
        } catch(error) {
            this.errorText = error.message
            return
        }

        // add to user model in db
        const newUser = await User.create({
            discordUserId: discordUserId,
            registeredDate: new Date(),
            discordUsername: discordUsername,
            playerName: ssUser.playerInfo.playerName,
            scoreSaberPlayerId: ssUser.playerInfo.playerId,
            currentPP: ssUser.playerInfo.pp,
            scoreSaberCountry: ssUser.playerInfo.country,
            scoreSaberAvatarPath: ssUser.playerInfo.avatar,
            globalRank: ssUser.playerInfo.rank,
            countryRank: ssUser.playerInfo.countryRank,
            avgRankedAccuracy: ssUser.scoreStats.averageRankedAccuracy,
            lastPeriodicStatusCheck: new Date()
        })

        return newUser
    }


    public unlinkUser() {

    }


}