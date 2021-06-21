import { User, UserScore, Song } from "../model/index"
import { Player } from "@ts/interfaces";
import ScoreSaberApi, { ScoreOrder }  from "@lib/ScoreSaberApi"
import { ScoreReply, Score } from "@ts/interfaces"
import { Op } from "sequelize"
import { PLAYER_STATUS_CHECK_INTERVAL_MIN, SSCountries } from "../config"
import discordClient from "@utils/discordClient"


/**
 * Class to handle and store new user scores periodically.
 */
export default class PeriodicPlayerStatusChecker {

    /** List of argentina users (plain objects) before being updated (used for leaderboard comparison of rank change). */
    private argUsersBeforeUpdate: User[]
    /** List of argentina users (plain objects) after being updated (used for leaderboard comparison of rank change) */
    private argUsersAfterUpdate: User[]


    /**
     * Continue the period player status checking
     */
    public async continueCheck() {
        await this.checkArgentinaPlayers()
        await this.checkRestOfPlayers()
    }


    /**
     * Fetch and update status of all argentina leaderboard players
     */
    private async checkArgentinaPlayers() {

        this.argUsersAfterUpdate = []
        this.argUsersBeforeUpdate = []

        const usersPendingCheck = await User.findAll({
            where: { scoreSaberCountry: SSCountries.ARG },
            order: [["lastPeriodicStatusCheck", "ASC"]]
        })
        
        const ssApi = new ScoreSaberApi()

        for(const user of usersPendingCheck) {
            this.argUsersBeforeUpdate.push(this.getPlainObjCopyOfUser(user)) // Save copy of old data
            const player = await ssApi.getPlayer(user.scoreSaberPlayerId)

            // Update user data and save copy of updated data
            this.alterUserWithScoresaberPlayerData(user, player)
            this.argUsersAfterUpdate.push(this.getPlainObjCopyOfUser(user))

            console.log("Saving player status: ", user.playerName)
            await user.save()
        }

        this.compareArgPlayerRankingChanges() // async
    }

    /**
     * Fetch and update status of the rest of the players (not argentina), which also haven't yet been updated in PLAYER_STATUS_CHECK_INTERVAL_MIN minutes
     */
    private async checkRestOfPlayers() {

        const checkUpToDate = new Date((new Date).getTime() - PLAYER_STATUS_CHECK_INTERVAL_MIN * 60 * 1000 )

        const usersPendingCheck = await User.findAll({
            where: { 
                scoreSaberCountry: { [Op.not]: SSCountries.ARG },
                lastPeriodicStatusCheck: { [Op.lte]: checkUpToDate }
            },
            order: [["lastPeriodicStatusCheck", "ASC"]]
        })

        const ssApi = new ScoreSaberApi()

        for(const user of usersPendingCheck) {
            const player = await ssApi.getPlayer(user.scoreSaberPlayerId)
            this.alterUserWithScoresaberPlayerData(user, player)
            console.log("Saving player status: ", user.playerName)
            await user.save()
        }

    }


    alterUserWithScoresaberPlayerData(user: User, player: Player) {
        user.currentPP = player.playerInfo.pp
        user.globalRank = player.playerInfo.rank
        user.countryRank = player.playerInfo.countryRank
        user.playerName = player.playerInfo.playerName
        user.scoreSaberAvatarPath = player.playerInfo.avatar
        user.avgRankedAccuracy = player.scoreStats.averageRankedAccuracy
        user.lastPeriodicStatusCheck = new Date()
    }

    /**
     * Add a copy of an argentina user (player) before being updated to compare its changes later.
     * @param user 
     */
    getPlainObjCopyOfUser(user: User) {
        const userObj: any = {}
        Object.assign(userObj, user)
        return userObj
    }


    compareArgPlayerRankingChanges() {

        console.log("Initializing comparison of argentina players...")

        for(const updatedUser of this.argUsersAfterUpdate) {
            
            const userBeforeUpdate = this.argUsersBeforeUpdate.find(user => user.scoreSaberPlayerId == updatedUser.scoreSaberPlayerId) // this must exist so we don't event need to check
            
            if(updatedUser.countryRank > userBeforeUpdate.countryRank) { // player increased their country ranking

                const playersSurpassed: User[] = []
                const usersBelowUpdatedUser = this.argUsersAfterUpdate.filter(user => user.countryRank < updatedUser.countryRank)

                for(const lowerRankUser of usersBelowUpdatedUser) { // irate over all of the players with currently lower rank than the user we're iterating

                    const lowerRankUserBeforeUpdate = this.argUsersBeforeUpdate.find(user => user.scoreSaberPlayerId == lowerRankUser.scoreSaberPlayerId)

                    if(lowerRankUserBeforeUpdate.countryRank > userBeforeUpdate.countryRank) { // the lowerRankUser had higher rank than updatedUser before the update => it was surpassed by updatedUser
                        playersSurpassed.push(lowerRankUser)
                    }
                }

                if(playersSurpassed.length > 0) {
                    this.sendSpicyPlayerSurpassAnnouncement(updatedUser, playersSurpassed)
                }

            }

        }

            

    }


    /**
     * Send a spicy announcement about a player having surpassed other player/s in the leaderboard.
     * @param user 
     * @param usersSurpassed 
     */
    sendSpicyPlayerSurpassAnnouncement(user: User, usersSurpassed: User[]) {
        //discordClient.channels.cache.find()
    }




}