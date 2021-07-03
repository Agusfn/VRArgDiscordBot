import { User, UserScore, Song } from "../model/index"
import { Player } from "@ts/interfaces";
import ScoreSaberApi, { ScoreOrder }  from "@lib/ScoreSaberApi"
import { ScoreReply, Score, UserRankInfo } from "@ts/interfaces"
import { Op } from "sequelize"
import { PLAYER_STATUS_CHECK_INTERVAL_MIN, SCORE_ANNOUNCEMENTS_CHANNEL_ID, SSCountries } from "../config"
import discordClient from "@utils/discordClient"
import { TextChannel } from "discord.js";
import logger from "@utils/logger";


/**
 * Class to handle and store new user scores periodically.
 */
export default class PlayerStatusChecker {

    private comparedUsersBeforeUpdate: UserRankInfo[]
    private comparedUsersAfterUpdate: UserRankInfo[]

    private fetcherRunning = false

    public isFetcherRunning() {
        return this.fetcherRunning
    }

    /**
     * Fetch and update status of all players
     */
    public async checkAllPlayersStatus() {

        this.fetcherRunning = true

        this.comparedUsersBeforeUpdate = []
        this.comparedUsersAfterUpdate = []

        const usersPendingCheck = await User.findAll({ order: [["lastPeriodicStatusCheck", "ASC"]] })
        
        const ssApi = new ScoreSaberApi()

        for(const user of usersPendingCheck) {

            if(user.announcementsEnabled)
                this.comparedUsersBeforeUpdate.push(user.getRankInfo())
            
            const player = await ssApi.getPlayer(user.scoreSaberPlayerId)

            // Update user data and save copy of updated data
            this.alterUserWithScoresaberPlayerData(user, player)
            await user.save()
            logger.info(`Updated ${user.discordUsername} (scoresaber ${user.playerName}) player status.`)

            if(user.announcementsEnabled)
                this.comparedUsersAfterUpdate.push(user.getRankInfo())
        }

        this.fetcherRunning = false

        //this.comparePlayersRankingChanges() // async
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


    /**
     * Compare player ranking changes for all the players who had the ranking announcements enabled.
     */
    comparePlayersRankingChanges() {

        console.log("Initializing comparison of players...")

        for(const updatedUser of this.comparedUsersAfterUpdate) {
            
            const userBeforeUpdate = this.comparedUsersBeforeUpdate.find(user => user.discordUserId == updatedUser.discordUserId) // this must exist so we don't event need to check
            
            if(updatedUser.globalRank > userBeforeUpdate.globalRank) { // player increased their country ranking

                const playersSurpassed: UserRankInfo[] = []
                const usersBelowUpdatedUser = this.comparedUsersAfterUpdate.filter(user => user.globalRank < updatedUser.globalRank)

                for(const lowerRankUser of usersBelowUpdatedUser) { // iterate over all of the players with currently lower rank than the user we're iterating

                    const lowerRankUserBeforeUpdate = this.comparedUsersBeforeUpdate.find(user => user.discordUserId == lowerRankUser.discordUserId)

                    if(lowerRankUserBeforeUpdate.globalRank > userBeforeUpdate.globalRank) { // the lowerRankUser had higher rank than updatedUser before the update => it was surpassed by updatedUser
                        playersSurpassed.push(lowerRankUser)
                    }
                }

                if(playersSurpassed.length > 0) {
                    this.sendPlayerSurpassAnnouncement(updatedUser, playersSurpassed)
                }

            }

        }

            

    }


    /**
     * Send an announcement about a player having surpassed other player/s in the leaderboard.
     * @param user 
     * @param usersSurpassed 
     */
    sendPlayerSurpassAnnouncement(user: UserRankInfo, usersSurpassed: UserRankInfo[]) {

        const channel = <TextChannel>discordClient.channels.cache.find(channel => channel.id == SCORE_ANNOUNCEMENTS_CHANNEL_ID)
        if(channel) {
            let surpassedPlayers = ""

            if(surpassedPlayers.length == 1) {
                surpassedPlayers = `<@${user.discordUserId}>`
            } else {
                for(let i=0; i<usersSurpassed.length; i++) {
                    surpassedPlayers += `<@${user.discordUserId}>`
                    if(i < usersSurpassed.length - 2) {
                        surpassedPlayers += ", "
                    } else if(i == usersSurpassed.length - 2) { // second last
                        surpassedPlayers += " y "
                    }
                }
            }

            channel.send(`<@${user.discordUserId}> acaba de sobrepasar en el ranking de ScoreSaber a ${surpassedPlayers}!`)
        }


    }




}