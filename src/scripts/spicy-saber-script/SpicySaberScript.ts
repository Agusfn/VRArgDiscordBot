import Script from "../Script"
import { Message } from "discord.js"
import initModels from "./db/initModels"
import { UserScore } from "./model/index"
import { CronFrequency } from "@ts/enums"
import UserProfileLinking from "./lib/UserProfileLinking"
import UserScoreFetcher from "./lib/UserScoreFetcher"
import PeriodicPlayerStatusChecker from "./lib/PeriodicPlayerStatusChecker"
import discordClient from "@utils/discordClient"
import {TextChannel} from "discord.js"

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
    private playerStatusChecker: PeriodicPlayerStatusChecker

    private playerCheckerRunning = false
    private historicFetcherRunning: boolean = false


    /**
     * (Optional) Event when discord client is ready, called slightly after onInitialized()
     */
    protected async onDiscordReady() {       
        console.log("discord channels", JSON.stringify(discordClient.channels.cache, null, 4))
        const channel = <TextChannel>discordClient.channels.cache.find(channel => channel.id == "856383011443572766")
        channel.send("Hola!! <@455891068580528153> tagueado rey")
    }

    /**
     * (Optional) Register any commands here.
     */
    public async onInitialized() {

        // Initialize score fetcher
        this.scoreFetcher = new UserScoreFetcher()
        this.scoreFetcher.initialize() // (async)

        // Register commands
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



        this.addCommand("deslinkear", null, async () => {

            // 


        })


        /**
         * User periodic status (score, rank, etc) check cron job. Should be very quick for a handful of users.
         */
        //this.addCustomCron("*/30 * * * *", async () => {
          /*  if(this.playerCheckerRunning) {
                return
            }
            this.scoreFetcher.pause()
            this.playerCheckerRunning = true

            console.log("Running user periodic status check...")
            await this.playerStatusChecker.continueCheck()

            this.scoreFetcher.resume()
            this.playerCheckerRunning = false
        })*/
        

        // Cron each 10 mins (on minute 0, 10, 20, ...)
        //this.addCustomCron("*/1 * * * *", async () => {
        /*
            if(this.historicFetcherRunning) {
                return
            }
            
            this.historicFetcherRunning = true
            console.log("Running user historic score fetcher...")
            // run periodic user status fetching
            await this.scoreFetcher.continueHistoricFetching()
            // run periodic score fetching
            this.historicFetcherRunning = false
        })*/

    }
    
}