import { LeaderboardInfo, PlayerScoreCollection, PlayerScore as PlayerScoreAPI } from "../utils/index"
import { SSPlayer, Leaderboard, PlayerScore } from "../model/index"
import { LeaderboardI, PlayerScoreI } from "../ts"
import { ScoreSaberDataCache } from "./ScoreSaberDataCache"
import logger from "@utils/logger"
import { roundNumber } from "@utils/index"
import { PlayerTriggerEvents } from "../lib/PlayerTriggerEvents"

/**
 * Class that handles the creation in database of new player scores and their related learboard (creation if doesn't exist, or update if modified)
 */
export class PlayerScoreSaverService {
    
    constructor(private ssCache: ScoreSaberDataCache) {

    }

    /**
     * Store a page of scores taken from SS API for a given SSPlayer, and store any Leaderboard (song map) that was not previously stored. Used in historic fetcher.
     * @param player The ScoreSaber Player
     * @param allPlayerScoreIds Array that contains all the user current stored score ids. Is used to avoid storing repeated scores.
     * @param scoreCollection Collection of scores from ScoreSaber API for a given page
     */
    public async saveHistoricScorePageForPlayer(player: SSPlayer, scoreCollection: PlayerScoreCollection) {

        // We will bulk save the PlayerScores and Leaderboards unlike with periodic fetching, since historic fetching saves scores and maps in a larger scale
        const leaderboardsToSave: LeaderboardI[] = []
        const leaderboardsToUpdate: LeaderboardI[] = []
        const scoresToSave: PlayerScoreI[] = []
        
        for(const score of scoreCollection.playerScores) {

            // Save new Leaderboards (song map info) associated with the score
            if(!this.ssCache.leaderboardExists(score.leaderboard.id)) {
                if(!leaderboardsToSave.find(leaderboard => leaderboard.id == score.leaderboard.id)) {
                    leaderboardsToSave.push(this.leaderboardFromAPILeaderBoard(score.leaderboard))
                }
            } else {
                if(!this.ssCache.leaderboardHasRankStatus(score.leaderboard.id, score.leaderboard.ranked)) {
                    leaderboardsToUpdate.push(this.leaderboardFromAPILeaderBoard(score.leaderboard))
                }
            }

            // Save player score, given it's not already present in DB (ids held in allPlayerScoreIds)
            if(!this.ssCache.playerHasScoreSubmission(player.id, score.score.id, (new Date(score.score.timeSet)).getTime() ) && !scoresToSave.find(scoreItem => scoreItem.id == score.score.id)) {
                scoresToSave.push(this.playerScoreFromAPIScore(score, player.id))
            }
        }

        // Save Leaderboards in DB and cache
        await Leaderboard.bulkCreate(leaderboardsToSave)
        this.ssCache.addLeaderboards(leaderboardsToSave)

        // Add PlayerScores to DB and cache
        await PlayerScore.bulkCreate(scoresToSave)
        const scoreSubmissions = scoresToSave.map(score => ({ ssScoreId: score.ssId, timeSetUnix: score.timeSet.getTime() }))
        this.ssCache.pushScoresForPlayer(player.id, scoreSubmissions)

        if(process.env.DEBUG == "true") {
            logger.info("Historic fetcher: Bulk saved " + leaderboardsToSave.length + " new leaderboards (maps)")
            logger.info("Historic fetcher: Bulk saved " + scoresToSave.length + " new scores")
        }


    }


    /**
     * Save multiple scores (and new leaderboards) from a recent page of scores of a player for periodic fetcher. Each score will be saved until a repeated score is found, in which case it will stop the loop.
     * @param player 
     * @param score 
     */
    public async saveNewScoresForPlayer(player: SSPlayer, scoreCollection: PlayerScoreCollection) {

        let newScoreListEndReached = false
        
        const leaderboardsToSave: LeaderboardI[] = []
        const scoresToSave: PlayerScoreI[] = []
        const leaderboardsToUpdate: LeaderboardI[] = []

        for(const score of scoreCollection.playerScores) {

            // we'll break upon the first repeated score of the player, or the first score older than the registration Date (score page lists are ordered chronologically from API)
            if((new Date(score.score.timeSet)) < player.createdAt || this.ssCache.playerHasScoreSubmission(player.id, score.score.id, (new Date(score.score.timeSet)).getTime() )) { 
                newScoreListEndReached = true
                break
            }

            // Set new score to be saved in DB
            if(!scoresToSave.find(scoreItem => scoreItem.id == score.score.id)) { // there should never be repeated scores from api collection, but we check just in case
                scoresToSave.push(this.playerScoreFromAPIScore(score, player.id))
            }

            // Set new Leaderboards (song map info) associated with the score to save in db (if it doesn't exist in DB)
            if(!this.ssCache.leaderboardExists(score.leaderboard.id)) {
                if(!leaderboardsToSave.find(leaderboard => leaderboard.id == score.leaderboard.id)) {
                    leaderboardsToSave.push(this.leaderboardFromAPILeaderBoard(score.leaderboard))
                }
            } else {
                if(!this.ssCache.leaderboardHasRankStatus(score.leaderboard.id, score.leaderboard.ranked)) {
                    leaderboardsToUpdate.push(this.leaderboardFromAPILeaderBoard(score.leaderboard))
                }
            }

        }
        
        // Save Leaderboards in DB and cache
        await Leaderboard.bulkCreate(leaderboardsToSave)
        this.ssCache.addLeaderboards(leaderboardsToSave)

        // Update Leaderboards in DB and cache
        await this.updateLeaderboards(leaderboardsToUpdate)

        // Add PlayerScores to DB and cache
        await PlayerScore.bulkCreate(scoresToSave)  
        const scoreSubmissions = scoresToSave.map(score => ({ ssScoreId: score.ssId, timeSetUnix: score.timeSet.getTime() }))
        this.ssCache.pushScoresForPlayer(player.id, scoreSubmissions)



        if(process.env.DEBUG == "true") { // to-do: maybe use something like logger.debug to avoid this check on every log
            logger.info("Periodic fetcher: Bulk saved " + leaderboardsToSave.length + " new leaderboards (maps)")
            logger.info("Periodic fetcher: Bulk saved " + scoresToSave.length + " new scores")
        }

        // (async) Call event trigger of player submitting new score page
        if(scoresToSave.length > 0) {
            PlayerTriggerEvents.onPlayerSubmitNewScorePage(player, scoresToSave)
        }

        return {
            newScoreListEndReached: newScoreListEndReached
        }

    }


    /**
     * Update the data of an existing Leaderboard, with update data from another Leaderboard. 
     * We'll update the ranked data only since that's the most likely thing that may change in it.
     * @param leaderboardsToUpdate 
     */
    private async updateLeaderboards(leaderboardsToUpdate: LeaderboardI[]) {

        for(const leaderboard of leaderboardsToUpdate) {

            await Leaderboard.update({
                maxScore: leaderboard.maxScore,
                rankedDate: leaderboard.rankedDate ? new Date(leaderboard.rankedDate) : null,
                qualifiedDate: leaderboard.qualifiedDate ? new Date(leaderboard.qualifiedDate) : null,
                ranked: leaderboard.ranked,
                qualified: leaderboard.qualified,
                stars: leaderboard.stars,
            }, { where: { id: leaderboard.id } })

            this.ssCache.updateLeaderboardRankStatus(leaderboard.id, leaderboard.ranked)

            logger.info("Updated data of existing leaderboard: " + leaderboard.songName)
        }

    }


    /**
     * Make a plain object for a Leaderboard from the Leaderboard data from the API.
     * @param score 
     * @returns 
     */
    private leaderboardFromAPILeaderBoard(leaderboard: LeaderboardInfo): LeaderboardI {
        return {
            id: leaderboard.id, // PK is ScoreSaber Leaderboard id
            songHash: leaderboard.songHash,
            songName: leaderboard.songName,
            songSubName: leaderboard.songSubName,
            songAuthorName: leaderboard.songAuthorName,
            levelAuthorName: leaderboard.levelAuthorName,
            difficultyNumber: leaderboard.difficulty.difficulty,
            difficultyName: leaderboard.difficulty.difficultyRaw,
            maxScore: leaderboard.maxScore,
            createdDate: new Date(leaderboard.createdDate),
            rankedDate: leaderboard.rankedDate ? new Date(leaderboard.rankedDate) : null,
            qualifiedDate: leaderboard.qualifiedDate ? new Date(leaderboard.qualifiedDate) : null,
            ranked: leaderboard.ranked,
            qualified: leaderboard.qualified,
            stars: leaderboard.stars,
            coverImage: leaderboard.coverImage
        }
    }

    /**
     * Create a PlayerScore javascript plain object given a PlayerScoreAPI response object, which contains both score and leaderboard (map) information
     * @param apiScore 
     * @param ssPlayerId 
     * @returns 
     */
    private playerScoreFromAPIScore(apiScore: PlayerScoreAPI, ssPlayerId: string): PlayerScoreI {
        const score = apiScore.score

        let accuracy = null
        if(apiScore.leaderboard.maxScore != null && apiScore.leaderboard.maxScore > 0) { // maxScore is 0 if map is unranked
            accuracy = roundNumber((score.modifiedScore / apiScore.leaderboard.maxScore) * 100, 2)
        }

        return {
            id: null, // PK id is auto generated
            ssId: score.id, // ScoreSaber Score id
            playerId: ssPlayerId,
            leaderboardId: apiScore.leaderboard.id,
            rank: score.rank,
            baseScore: score.baseScore,
            modifiedScore: score.modifiedScore,
            pp: score.pp,
            accuracy: accuracy,
            weight: roundNumber(score.weight, 8),
            modifiers: score.modifiers,
            multiplier: score.multiplier,
            badCuts: score.badCuts,
            missedNotes: score.missedNotes,
            maxCombo: score.maxCombo,
            fullCombo: score.fullCombo,
            timeSet: new Date(score.timeSet)
        }
    }
 
    
}