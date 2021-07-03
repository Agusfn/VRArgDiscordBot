import { User, UserScore, Song } from "../model/index"
import ScoreSaberApi, { ScoreOrder }  from "@lib/ScoreSaberApi"
import { ScoreReply, Score } from "@ts/interfaces"
import { sleep } from "@utils/other"
import logger from "@utils/logger"

/**
 * Class to handle historic score fetching for new users. Doesn't take care of fetching new scores, only scores from the moment they register, to the past.
 */
export default class UserScoreFetcher {


    private initialized: boolean = false

    /**
     * In-memory list of all the songHashes of all the songs stored in the database.
     */
    private wholeSongHashList: string[]


    private paused = false

    private fetchRunning = false


    public isFetchRunning() {
        return this.fetchRunning
    }


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

    /** Pause the fetching, should only be done if it's running. If it is not, it will have no effect */
    public pause() {
        this.paused = true
    }

    /** Resume the fetching, should only be done if it's running. If it is not, it will have no effect */
    public resume() {
        this.paused = false
    }

    /**
     * Continue the user historic score fetching algorithm. Will keep running until ALL users have had their history saved, or until it raises some error.
     * A likely error is "too many requests" from scoresaber API. In which case it will halt and resume safely in the next cron call.
     */
    public async continueHistoricFetching() {

        this.fetchRunning = true

        const usersPending = await User.findAll({where: { fetchedAllScoreHistory: false }})

        for(let user of usersPending) {

            logger.info(`Fetching historic scores for ${user.discordUsername} (scoresaber: ${user.playerName})`)

            // Obtener un array con todos sus scoreIds registrados
            const userScoreIds = (await UserScore.findAll({
                where: { discordUserId: user.discordUserId },
                attributes: ["scoreId"]
            })).map(score => score.scoreId)

            let endPageReached = false
            let nextFetchPage = user.lastHistoryFetchPage + 1
            const api = new ScoreSaberApi()

            let songsLoaded = 0

            while(!endPageReached) {

                while(this.paused) {
                    logger.info("User score fetcher is paused... waiting for resume.")
                    await sleep(20000)
                }
                
                // Fetch page. Any error (too many requests, most likely) will be caught by cron try-catch, but each page is saved and can be resumed
                const pageScores = await api.getScores(user.scoreSaberPlayerId, ScoreOrder.RECENT, nextFetchPage)
 
                if(pageScores.scores.length > 0) {
                    
                    // plain objects to bulk create for each page
                    const songsToSave = []
                    const scoresToSave = []
                    
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

                    songsLoaded += songsToSave.length
                    await Song.bulkCreate(songsToSave)
                    await UserScore.bulkCreate(scoresToSave)

                    if(nextFetchPage % 10 == 0) {
                        logger.info(`Page ${nextFetchPage} of historic scores loaded. New songs loaded in last 10 pages: ${songsLoaded}`)
                        songsLoaded = 0
                    }
    
                    user.lastHistoryFetchPage = nextFetchPage
                    await user.save()
                    nextFetchPage += 1
    
                } else { // end page reached
                    logger.info(`Finished loading historic scores for user ${user.discordUsername} (scoresaber ${user.playerName})`)
                    endPageReached = true
                    user.fetchedAllScoreHistory = true
                    await user.save()
                }

            }
                
        }

        this.fetchRunning = false

    }

    /*public async continueCheck2() {

        const aMomentAgo = new Date((new Date).getTime() - PLAYER_STATUS_CHECK_INTERVAL_MIN * 60 * 1000 )

        const usersPendingCheck = await User.findAll({
            where: { lastPeriodicStatusCheck: { [Op.lte]: aMomentAgo } },
            order: [ ["lastPeriodicStatusCheck", "ASC"] ]
        })
        console.log("usersPendingCheck", usersPendingCheck)

        const ssApi = new ScoreSaberApi()

        for(const user of usersPendingCheck) {

            const lastScore = await UserScore.findOne({
                attributes: ["scoreId"],
                where: { discordUserId: user.discordUserId },
                order: [ ["date", "DESC"] ],
                limit: 1
            })
            if(!lastScore) return

            let currentPage = 1, endPageReached = false
            

            while(!endPageReached) {

                const pageScores = await ssApi.getScores(user.scoreSaberPlayerId, ScoreOrder.RECENT, currentPage)

                for(const score of pageScores.scores) {

                    if(score.scoreId == lastScore.scoreId) {
                        endPageReached = true
                        break
                    }
                    // Si el score id no es el ultimo registrado
                        // Guardar en la db
                    // Si es el ultimo registrado
                        // Updatear lastPeriodicFetch del user a now()
                        // setear endPageReached=true
                        // Breakear este loop
                }
                // Para cada score:

                // Incrementar n+=1
            }
            
            console.log("Updating user " + user.playerName)
            user.lastPeriodicStatusCheck = new Date()
            await user.save()

        }
            

    }*/

    private continueLatestScoresFetching() {

        // Obtener todos los users ordenados por lastPeriodicFetch más antiguo (se supone que se actualizarán todos los users, pero si scoresaber API limita las requests, algunos users quedarán desactualizados)
        // Para cada user:
            // Obtener su id de score más reciente, de la db
            // Mientras endPageReached=false
                // Obtener su página de scores n (o n=1 inicialmente)
                // Si da error en obtener score (max requests), terminar ejecucion.
                // Para cada score:
                    // Si el score id no es el ultimo registrado
                        // Guardar en la db
                    // Si es el ultimo registrado
                        // Updatear lastPeriodicFetch del user a now()
                        // setear endPageReached=true
                        // Breakear este loop
                // Incrementar n+=1

    }


    private onUserNewScoreSubmit() {
        // Si el score es relevante (ver cómo, si es mayor a cierto pp, o a cierto pp de acuerdo a su nivel, o que onda)
            // Si es user de arg:
                // Obtener score y user con más pp de esa cancion de users de dicho pais (usar join)
                // Si el score es mas alto
                    // Tirar anuncio picante
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

