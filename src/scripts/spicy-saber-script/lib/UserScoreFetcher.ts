import { User, UserScore, Song } from "../model/index"
import ScoreSaberApi, { ScoreOrder }  from "@lib/ScoreSaberApi"
import { ScoreReply, Score } from "@ts/interfaces"


/**
 * Class to handle historic score fetching for new users. Doesn't take care of fetching new scores, only scores from the moment they register, to the past.
 */
export default class UserScoreFetcher {


    private initialized: boolean = false

    /**
     * In-memory list of all the songHashes of all the songs stored in the database.
     */
    private wholeSongHashList: string[]


    /**
     * Initialize the fetcher, loading the in-memory list of song hashes.
     */
    public async initialize() {
        if(this.initialized) return
        this.initialized = true

        // Load whole song hash list
        this.wholeSongHashList = (await Song.findAll({ attributes: ["songHash"] })).map(song => song.songHash)
        console.log("ScoreFetcher initialized. Current song hash list: ", this.wholeSongHashList)
    }


    /**
     * Continue the user historic score fetching algorithm. Will keep running until ALL users have had their history saved, or until it raises some error.
     * A likely error is "too many requests" from scoresaber API. In which case it will halt and resume safely in the next cron call.
     */
    public async continueHistoricFetching() {

        const usersPending = await User.findAll({where: { fetchedAllScoreHistory: false }})

        for(let user of usersPending) {

            // Obtener un array con todos sus scoreIds registrados
            const userScoreIds = (await UserScore.findAll({
                where: { discordUserId: user.discordUserId },
                attributes: ["scoreId"]
            })).map(score => score.scoreId)

            console.log("Processing user: ", user.scoreSaberPlayerId, ". Current scoreIds: ", userScoreIds)

            let endPageReached = false
            let nextFetchPage = user.lastFetchPage + 1
            const api = new ScoreSaberApi()

            while(!endPageReached) {
                
                // Fetch page. Any error (too many requests, most likely) will be caught by cron catch, but each page is saved and can be resumed
                const pageScores = await api.getScores(user.scoreSaberPlayerId, ScoreOrder.RECENT, nextFetchPage)
 
                if(pageScores.scores.length > 0) {
                    
                    // plain objects to bulk create for each page
                    const songsToSave = []
                    const scoresToSave = []
                    
                    console.log(`Page: ${nextFetchPage}. Scores: ${pageScores.scores.length}`, "ScoreIds: ", pageScores.scores.map(score => score.scoreId))
    
                    for(let score of pageScores.scores) {
                        if(!this.wholeSongHashList.includes(score.songHash)) {
                            this.wholeSongHashList.push(score.songHash)
                            songsToSave.push(this.makeSongObjectFromScore(score))
                        }
                        if(!userScoreIds.includes(score.scoreId)) { // user doesn't have this score registered
                            userScoreIds.push(score.scoreId)
                            scoresToSave.push(this.makeUserScoreObject(score, user.discordUserId))
                        }
                    }

                    await Song.bulkCreate(songsToSave)
                    await UserScore.bulkCreate(scoresToSave)
    
                    user.lastFetchPage = nextFetchPage
                    await user.save()
                    nextFetchPage += 1
    
                } else { // end page reached
                    console.log(`Finished loading historic scores for user ${user.playerName} (scoresaber ${user.scoreSaberPlayerId})`)
                    endPageReached = true
                    user.fetchedAllScoreHistory = true
                    await user.save()
                }

            }
                
        }
    }



    private makeSongObjectFromScore(score: Score): object {
        return {
            songHash: score.songHash,
            songName: score.songName,
            songSubName: score.songSubName,
            songAuthorName: score.songAuthorName,
            levelAuthorName: score.levelAuthorName
        }
    }

    private makeUserScoreObject(score: Score, discordUserId: string): object {
        return {
            scoreId: score.scoreId,
            date: new Date(score.timeSet),
            discordUserId: discordUserId,
            songHash: score.songHash,
            globalRank: score.rank,
            score: score.score,
            pp: score.pp,
            weight: score.weight
        }
    }




}