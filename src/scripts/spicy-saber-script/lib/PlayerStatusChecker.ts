import { User, UserScore, Song } from "../model/index"
import { Player } from "@ts/interfaces";
import ScoreSaberApi, { ScoreOrder }  from "@lib/ScoreSaberApi"
import { ScoreReply, Score, UserRankInfo } from "@ts/interfaces"
import { Op } from "sequelize"
import { PLAYER_STATUS_CHECK_INTERVAL_MIN, SCORE_ANNOUNCEMENTS_CHANNEL_ID, SSCountries } from "../config"
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

    public setFetchRunning(val: boolean) {
        this.fetcherRunning = val
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

            //logger.info(`Updated ${user.discordUsername} (scoresaber ${user.playerName}) player status.`)

            if(user.announcementsEnabled) {
                this.comparedUsersAfterUpdate.push(user.getRankInfo())
            }
                
        }

        this.fetcherRunning = false

        this.comparePlayersRankingChanges() // async
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


        for(const updatedUser of this.comparedUsersAfterUpdate) {
            
            const userBeforeUpdate = this.comparedUsersBeforeUpdate.find(user => user.discordUserId == updatedUser.discordUserId) // this must exist so we don't event need to check
            
            if(updatedUser.globalRank < userBeforeUpdate.globalRank) { // player improved (lowered) their country ranking

                const playersSurpassed: UserRankInfo[] = []
                const usersBelowUpdatedUser = this.comparedUsersAfterUpdate.filter(user => user.globalRank > updatedUser.globalRank) // users which are now worse (higher) rank than updatedUser
                
                for(const lowerRankUser of usersBelowUpdatedUser) { // iterate over all of the players with currently lower rank than the user we're iterating

                    const lowerRankUserBeforeUpdate = this.comparedUsersBeforeUpdate.find(user => user.discordUserId == lowerRankUser.discordUserId)

                    if(lowerRankUserBeforeUpdate.globalRank < userBeforeUpdate.globalRank) { // the lowerRankUser had better (lower) rank than updatedUser before the update => it was surpassed by updatedUser
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
            let surpassedPlayersTxt = ""

            if(surpassedPlayersTxt.length == 1) {
                surpassedPlayersTxt = `<@${usersSurpassed[0].discordUserId}>`
            } else {
                for(let i=0; i<usersSurpassed.length; i++) {

                    surpassedPlayersTxt += `<@${usersSurpassed[i].discordUserId}>`

                    if(i < usersSurpassed.length - 2) {
                        surpassedPlayersTxt += ", "
                    } else if(i == usersSurpassed.length - 2) { // second last
                        surpassedPlayersTxt += " y a "
                    }
                }
            }

            //channel.send(`<@${user.discordUserId}> acaba de sobrepasar en el ranking de ScoreSaber a ${surpassedPlayers}!`)
            logger.info(`Player surpass announcement test: <@${user.discordUserId}> acaba de sobrepasar en el ranking de ScoreSaber a ${surpassedPlayersTxt}!`)
        }


    }




}