import Script from "../Script"
import { Message } from "discord.js"
import initModels from "./db/initModels"
import { UserScore } from "./model/index"
import { CronFrequency } from "@ts/enums"
import UserProfileLinking from "./lib/UserProfileLinking"
import HistoricScoreFetching from "./lib/HistoricScoreFetching"

export class SpicySaberScript extends Script {

    /**
     * Name of this script.
     */
    protected scriptName = "SpicySaber Script"

    /**
     * (Optional) Event the script is ready.
     */
    protected async onScriptReady() {       




    }

    /**
     * (Optional) Event when a user sends a message.
     */
    protected onUserMessage: undefined

    /**
     * (Optional) Specify function to load for initializing sequelize db models.
     */
    protected initDbModels = initModels


    private cronFetchersRunning: boolean = false


    /**
     * (Optional) Register any commands here.
     */
    protected onInitialize() {


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

            if(this.cronFetchersRunning) {
                console.log("Cron fetchers are stil running, skipping this call...")
                return
            }
            
            this.cronFetchersRunning = true
            console.log("Running cron...")

            await HistoricScoreFetching.continueFetch()

            this.cronFetchersRunning = false
            
        })

    }
    
}