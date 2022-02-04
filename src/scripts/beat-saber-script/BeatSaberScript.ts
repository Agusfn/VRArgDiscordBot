import { CommandManager, Script, Discord } from "@lib/index"
import { Message } from "discord.js"
import initModels from "./db/initModels"
import { PlayerScore } from "./model/index"
//import UserProfileLinking from "./lib/UserProfileLinking"
//import UserScoreFetcher from "./lib/UserScoreFetcher"
//import PlayerStatusChecker from "./lib/PlayerStatusChecker"
import {TextChannel} from "discord.js"
import logger from "@utils/logger"
import { ScoreSaberAPI } from "./utils"
import { ScoreSaberAccountManager, HistoricScoreFetcher, PlayerScoreSaver } from "./lib/index"

export class BeatSaberScript extends Script {

    /**
     * Name of this script.
     */
    protected scriptName = "Beat Saber Script"

    /**
     * (Optional) Event when a user sends a message.
     */
    protected onUserMessage: undefined

    /**
     * (Optional) Specify function to load for initializing sequelize db models.
     */
    public initDbModels = initModels


    public async onInitialized() {

        // Initialize important score fetching/saving classes
        await PlayerScoreSaver.initialize()

        // Start historic fetcher for any pending fetch scores from scoresaber accounts
        HistoricScoreFetcher.startFetcher()

    

        CommandManager.newCommand("linkear_ss", "<scoresaber id>", async (message: Message, args) => {
            // Validar param
            const scoreSaberId = args[0]
            if(!scoreSaberId || !/^\d{5,20}$/.test(scoreSaberId)) {
                message.reply("Ingresa un id numérico valido de entre 5 y 20 dígitos.")
                return
            }

            const accountManager = new ScoreSaberAccountManager()
            const ssPlayer = await accountManager.linkScoreSaberAccountToUser(message.author.id, scoreSaberId)

            if(ssPlayer) {
                message.reply(`La cuenta de ScoreSaber **${ssPlayer.name}** se te vinculó correctamente!`)
            } else {
                message.reply(accountManager.getErrorMsg())
            }
        }, "Vincular una cuenta de ScoreSaber a tu cuenta de Discord.", "BeatSaber")


        CommandManager.newAdminCommand("linkear_ss_admin", "<discord user id> <scoresaber id>", async (message: Message, args) => {
            // Validar params
            const discordUserId = args[0]
            const scoreSaberId = args[1]

            if(!discordUserId || !/^\d{5,20}$/.test(discordUserId)) {
                message.reply("Ingresa un id de Discord numérico valido de entre 5 y 20 dígitos.")
                return
            }
            if(!scoreSaberId || !/^\d{5,20}$/.test(scoreSaberId)) {
                message.reply("Ingresa un id de ScoreSaber numérico valido de entre 5 y 20 dígitos.")
                return
            }

            const discordUser = Discord.getGuild().members.cache.find(member => member.id == discordUserId)
            if(!discordUser) {
                message.reply("No se encontró el usuario de Discord con dicho ID.")
                return
            }

            const accountManager = new ScoreSaberAccountManager()
            const ssPlayer = await accountManager.linkScoreSaberAccountToUser(discordUserId, scoreSaberId, false)

            if(ssPlayer) {
                message.reply(`La cuenta de ScoreSaber **${ssPlayer.name}** se vinculó correctamente al usuario de Discord ${discordUser.user.username}!`)
            } else {
                message.reply(accountManager.getErrorMsg())
            }
        }, "Vincular una cuenta de ScoreSaber a una cuenta de Discord.", "BeatSaber")


        CommandManager.newCommand("deslinkear_ss", null, async (message: Message, args) => {

            const accountManager = new ScoreSaberAccountManager()
            const ssPlayer = await accountManager.unlinkScoreSaberAccountFromUser(message.author.id)

            if(ssPlayer) {
                message.reply(`La cuenta de ScoreSaber **${ssPlayer.name}** (ID ${ssPlayer.id}) se te desvinculó correctamente!`)
            } else {
                message.reply(accountManager.getErrorMsg())
            }

        }, "Desvincular la cuenta de ScoreSaber de tu cuenta de Discord.", "BeatSaber")


        CommandManager.newAdminCommand("deslinkear_ss_admin", "<discord user id>", async (message: Message, args) => {
            
            // Validar params
            const discordUserId = args[0]
            if(!discordUserId || !/^\d{5,20}$/.test(discordUserId)) {
                message.reply("Ingresa un id de Discord numérico valido de entre 5 y 20 dígitos.")
                return
            }

            const discordUser = Discord.getGuild().members.cache.find(member => member.id == discordUserId)
            if(!discordUser) {
                message.reply("No se encontró el usuario de Discord con dicho ID.")
                return
            }

            const accountManager = new ScoreSaberAccountManager()
            const ssPlayer = await accountManager.unlinkScoreSaberAccountFromUser(discordUserId, false)

            if(ssPlayer) {
                message.reply(`La cuenta de ScoreSaber **${ssPlayer.name}** (ID ${ssPlayer.id}) se desvinculó correctamente del usario de Discord ${discordUser.user.username}!`)
            } else {
                message.reply(accountManager.getErrorMsg())
            }

        }, "Desvincular una cuenta de ScoreSaber de una cuenta de Discord.", "BeatSaber")


        // Initialize score fetcher
        /*this.scoreFetcher = new UserScoreFetcher()
        this.playerStatusChecker = new PlayerStatusChecker()
      

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
        })*/


        /**
         * Register cron each 30 mins to update player statuses (total score, rank, pp).
         */
        //this.addCustomCron("*/30 * * * *", async () => {
            /*try {
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
        })*/
        

        /**
         * Register cron each 10 mins to save the historic scores for all users.
         * It's very frecuent since the fetching may be interrupted for too many requests to scoresaber API.
         */
        //this.addCustomCron("*/10 * * * *", async () => {
            /*try {
                if(this.scoreFetcher.isFetchRunning()) {
                    return
                }
                await this.scoreFetcher.continueHistoricFetching()
            } catch(error) {
                this.scoreFetcher.setFetchRunning(false)
                logger.error(error)
            }
        })*/

    }
    
}