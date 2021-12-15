import Script from "../Script"
import { Message } from "discord.js"
import initModels from "./db/initModels"
import { UserScore, User } from "./model/index"
import UserProfileLinking from "./lib/UserProfileLinking"
import UserScoreFetcher from "./lib/UserScoreFetcher"
import PlayerStatusChecker from "./lib/PlayerStatusChecker"
import discordClient from "@utils/discordClient"
import {TextChannel} from "discord.js"
import logger from "@utils/logger"

export class SpicySaberScript extends Script {

    /**
     * Name of this script.
     */
    protected scriptName = "SpicySaber Script"

    /**
     * (Optional) Event when a user sends a message.
     */
    protected onUserMessage: undefined

    /**
     * (Optional) Specify function to load for initializing sequelize db models.
     */
    protected initDbModels = initModels


    // **** Our custom attrs *****
    private scoreFetcher: UserScoreFetcher
    private playerStatusChecker: PlayerStatusChecker


    /**
     * (Optional) Event when discord client is ready, called slightly after onInitialized()
     */
    protected async onDiscordReady() {       
        /*console.log("discord channels", JSON.stringify(discordClient.channels.cache, null, 4))
        const channel = <TextChannel>discordClient.channels.cache.find(channel => channel.id == "856383011443572766")
        channel.send("Hola!! <@455891068580528153> tagueado rey")*/
    }

    /**
     * (Optional) Register any commands here. Called slightly before onDiscordReady()
     */
    public async onInitialized() {

        // Initialize score fetcher
        this.scoreFetcher = new UserScoreFetcher()
        this.playerStatusChecker = new PlayerStatusChecker()
        this.scoreFetcher.initialize() // (async) 


        // Register commands
        /*this.addCommand("linkear_trucho", "<nick discord> <id user discord> <id scoresaber>", async (message: Message, args) => {

            // Validar param
            const scoreSaberId = args[2]
            if(!scoreSaberId || !/^\d{5,20}$/.test(scoreSaberId)) {
                message.channel.send("Ingresa un id numérico valido de entre 5 y 20 dígitos.")
                return
            }

            const newUser = await UserProfileLinking.linkUser(args[1], args[0], scoreSaberId)
            if(newUser) {
                message.channel.send(`El usuario de ScoreSaber ${newUser.playerName} se ha vinculado exitosamente a tu cuenta!`)
            } else {
                message.channel.send(UserProfileLinking.getErrorText())
            }
            
        })*/

        this.addCommand("linkear", "<id scoresaber>", async (message: Message, args) => {

            // Validar param
            const scoreSaberId = args[0]
            if(!scoreSaberId || !/^\d{5,20}$/.test(scoreSaberId)) {
                message.channel.send("Ingresa un id numérico valido de entre 5 y 20 dígitos.")
                return
            }

            const newUser = await UserProfileLinking.linkUser(message.author.id, message.author.username, scoreSaberId)
            if(newUser) {
                message.channel.send(`El usuario de ScoreSaber ${newUser.playerName} se ha vinculado exitosamente a tu cuenta!`)
            } else {
                message.channel.send(UserProfileLinking.getErrorText())
            }
            
        })


        this.addCommand("anuncios_scores", null, async (message: Message, args) => {

            const user = await User.findByPk(message.author.id)

            if(!user) {
                message.channel.send(`Tu cuenta de scoresaber no está vinculada con tu cuenta de discord. Vinculala con /linkear <id scoresaber>.`)
                return
            }

            user.announcementsEnabled = !user.announcementsEnabled
            await user.save()

            if(user.announcementsEnabled) {
                message.channel.send(`Se reanudó la mención de tu perfil en los anuncios de scores.`)
            } else {
                message.channel.send(`Ya no se mencionará tu perfil de scoresaber en los anuncios de scores.`)
            }  
        })


        this.addCommand("deslinkear", null, async (message: Message, args) => {

            const user = await User.findByPk(message.author.id)

            if(!user) {
                message.channel.send(`No tenés una cuenta de scoresaber vinculada con tu cuenta de discord`)
                return
            }

            await UserScore.destroy({ where: {discordUserId: message.author.id} })
            await User.destroy({ where: {discordUserId: message.author.id} })

            message.channel.send(`Se desvinculó el perfil de scoresaber ${user.playerName} de tu cuenta de discord.`)
        })



        this.addCommand("playerinfo", null, async (message: Message, args) => {

            const user = await User.findByPk(message.author.id)

            if(!user) {
                message.channel.send(`No tenés una cuenta de scoresaber vinculada con tu cuenta de discord`)
                return
            }

            message.channel.send(`Scoresaber: ${user.playerName}\nPP: ${user.currentPP}\nCountry rank: ${user.countryRank}\nWorld rank: ${user.globalRank}\nLast profile update: ${user.lastStatusCheck().format("DD/MM/Y H:mm:ss")}`)
        })


        /**
         * Register cron each 30 mins to update player statuses (total score, rank, pp).
         */
        this.addCustomCron("*/30 * * * *", async () => {
            try {
                if(this.playerStatusChecker.isFetcherRunning()) { // already running (shouldn't happen, since it should take way less than 30 min)
                    return
                }
                this.scoreFetcher.pause() // pause score fetcher (if it's even running) so we can use scoresaber API for this higher priority task
                await this.playerStatusChecker.checkAllPlayersStatus()
                this.scoreFetcher.resume() // resume score fetcher
            } catch(error) {
                this.playerStatusChecker.setFetchRunning(false)
                logger.error(error) 
            }
        })
        

        /**
         * Register cron each 10 mins to save the historic scores for all users.
         * It's very frecuent since the fetching may be interrupted for too many requests to scoresaber API.
         */
        this.addCustomCron("*/10 * * * *", async () => {
            try {
                if(this.scoreFetcher.isFetchRunning()) {
                    return
                }
                await this.scoreFetcher.continueHistoricFetching()
            } catch(error) {
                this.scoreFetcher.setFetchRunning(false)
                logger.error(error)
            }
        })

    }
    
}