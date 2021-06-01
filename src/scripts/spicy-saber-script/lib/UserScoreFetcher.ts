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

    private i =0


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


    public async continueHistoricFetching() {

        const usersPending = await User.findAll({where: { fetchedAllScoreHistory: false }})
        console.log("Running user historic fetcher. Users pending to process: ", usersPending.map(user => user.playerName))

        userLoop:
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

                let userScores
                try {
                    userScores = await api.getScores(user.scoreSaberPlayerId, ScoreOrder.RECENT, nextFetchPage)
                } catch(error) {
                    console.log(`Halting historic fetcher for user ${user.playerName}. Reason: ${error.message}. Will continue in next iteration.`)
                    break userLoop
                }
 
                if(userScores.scores.length > 0) {
                    
                    console.log(userScores)
    
                    for(let score of userScores.scores) {

                        if(!this.wholeSongHashList.includes(score.songHash))
                            await this.saveNewSongFromScore(score)

                        if(!userScoreIds.includes(score.scoreId)) { // user doesn't have this score registered
                            const scoreEntity = await this.saveNewUserScore(score, user.discordUserId) // To-do: add song first because there is constraint fail otherwise and it won't log for some fuckin reason
                            console.log("saved score", scoreEntity.toJSON())
                            userScoreIds.push(score.scoreId)
                        }
                    }
    
                    user.lastFetchPage = nextFetchPage
                    await user.save()
                    nextFetchPage += 1
    
                } else { // end page reached
                    endPageReached = true
                    user.fetchedAllScoreHistory = true
                    await user.save()
                }

            }

                
        }

    }


    /**
     * Register a new song in the database from a score. The song must not exist previously on the db, otherwise a sql validation error will be thrown.
     * @param score 
     */
    private async saveNewSongFromScore(score: Score): Promise<Song> {

        if(this.wholeSongHashList.includes(score.songHash)) {
            throw Error("This song already exists in the database")
        }
        this.wholeSongHashList.push(score.songHash)
        console.log("Saving new song on db, song from score: ", score)
        return await Song.create({
            songHash: score.songHash,
            songName: score.songName,
            songSubName: score.songSubName,
            songAuthorName: score.songAuthorName,
            levelAuthorName: score.levelAuthorName
        })
    }


    private async saveNewUserScore(score: Score, discordUserId: string): Promise<UserScore> {
        console.log("Score to save: ", {
            scoreId: score.scoreId,
            date: new Date(score.timeSet),
            discordUserId: discordUserId,
            songHash: score.songHash,
            globalRank: score.rank,
            score: score.score,
            pp: score.pp,
            weight: score.weight
        })
        return await UserScore.create({
            scoreId: score.scoreId,
            date: new Date(score.timeSet),
            discordUserId: discordUserId,
            songHash: score.songHash,
            globalRank: score.rank,
            score: score.score,
            pp: score.pp,
            weight: score.weight
        })
    }




}