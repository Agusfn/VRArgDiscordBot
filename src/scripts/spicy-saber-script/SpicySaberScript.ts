import Script from "../Script"
import { Message } from "discord.js"
import initModels from "./db/initModels"
import { UserScore } from "./model/index"
import { CronFrequency } from "@ts/enums"
import UserProfileLinking from "./lib/UserProfileLinking"
import UserScoreFetcher from "./lib/UserScoreFetcher"

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


    private cronFetchersRunning: boolean = false


    // **** Our custom attrs *****

    private scoreFetcher: UserScoreFetcher

    
    /**
     * (Optional) Event when discord client is ready, called slightly after onInitialized()
     */
    protected async onDiscordReady() {       

    }

    /**
     * (Optional) Register any commands here.
     */
    public async onInitialized() {

        // Initialize score fetcher
        this.scoreFetcher = new UserScoreFetcher()
        await this.scoreFetcher.initialize() // (async)

        await UserScore.create({
            scoreId: 34585543,
            date: new Date("2020-04-22T19:57:07.000Z"),
            discordUserId: "455891068580528153",
            songHash: "12733D36CE7271844EFC86DE1CC432CE25D1DA2E",
            globalRank: 2,
            score: 876095,
            pp: 0,
            weight: 0
        })

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


        // Cron each 10 mins (on minute 0, 10, 20, ...)
        this.addCustomCron("*/2 * * * *", async () => {
        
            /*if(this.cronFetchersRunning) {
                console.log("Cron fetchers are stil running, skipping this call...")
                return
            }
            
            this.cronFetchersRunning = true
            console.log("Running cron...")

            await this.scoreFetcher.continueHistoricFetching()

            this.cronFetchersRunning = false*/
            
        })

    }
    
}