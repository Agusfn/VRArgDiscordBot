import Script from "../Script"
import { Message } from "discord.js"
import ScoreSaberApi from "@lib/ScoreSaberApi"
import initModels from "./db/initModels"
import { User } from "./model/index"
import { CronFrequency } from "@ts/enums"
import { Player } from "@ts/interfaces"

export class SpicySaberScript extends Script {

    /**
     * Name of this script.
     */
    protected scriptName = "SpicySaber Script"

    /**
     * (Optional) Event the script is ready.
     */
    protected onScriptReady() {       

    }

    /**
     * (Optional) Event when a user sends a message.
     */
    protected onUserMessage: undefined

    /**
     * (Optional) Specify function to load for initializing sequelize db models.
     */
    protected initDbModels = initModels

    /**
     * (Optional) Register any commands here.
     */
    protected onInitialize() {


        this.addCommand("linkear", "<id scoresaber>", async (message: Message, args) => {
            
            // Validar param
            const scoreSaberId = args[0]
            if(!scoreSaberId || !/^\d{5,20}$/.test(scoreSaberId)) {
                message.channel.send("Ingresa un id numérico valido.")
                return
            }

            // Chequear que el usuario actual no tenga un scoresaber linkeado
            const currentUser = await User.findByPk(message.author.id)
            if(currentUser != null) {
                message.channel.send(`Ya estás vinculado con la cuenta de ScoreSaber ${currentUser.playerName}. Para vincular a otra deberás primero desvincular con /deslinkear.`)
                return
            }

            // Chequear que no haya otro usuario con el scoresaber indicado
            const otherUserCount = await User.count({
                where: { scoreSaberPlayerId: scoreSaberId }
            })
            if(otherUserCount > 0) {
                message.channel.send(`Ya existe otro usuario usando ese perfil de scoresaber!`)
                return
            }

            // fetch user scoresaber
            const api = new ScoreSaberApi()
            let ssUser: Player
            try {
                ssUser = await api.getPlayer(scoreSaberId)
            } catch(error) {
                message.channel.send(error)
                return
            }
            console.log("ssUser", ssUser)

            // add to user model in db
            const newUser = await User.create({
                discordUserId: message.author.id,
                registeredDate: new Date(),
                discordUsername: message.author.username,
                playerName: ssUser.playerInfo.playerName,
                scoreSaberPlayerId: ssUser.playerInfo.playerId,
                currentPP: ssUser.playerInfo.pp,
                scoreSaberCountry: ssUser.playerInfo.country,
                scoreSaberAvatarPath: ssUser.playerInfo.avatar,
                globalRank: ssUser.playerInfo.rank,
                countryRank: ssUser.playerInfo.countryRank,
                avgRankedAccuracy: ssUser.scoreStats.averageRankedAccuracy
            })

            console.log("newUser", newUser.toJSON())

            message.channel.send(`El usuario de ScoreSaber ${newUser.playerName} se ha vinculado exitosamente a tu cuenta!`)
        })



        this.addCommand("deslinkear", null, async () => {

            

        })


        /*this.addCron(CronFrequency.MINUTELY, () => {
            console.log("Minutely cron...")
        })*/

    }
    
}