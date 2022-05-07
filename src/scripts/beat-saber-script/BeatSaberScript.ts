import { ScoreSaberAccountManager, HistoricScoreFetcher, ScoreSaberDataCache, PeriodicScoreFetcher, PlayerProfileUpdater, PlayerTriggerEvents } from "./lib/index"
import { CommandManager, Script, Discord } from "@lib/index"
import { Message, TextChannel } from "discord.js"
import initModels from "./db/initModels"
import { PlayerScore, SSPlayer } from "./model"
import { User } from "@models/index"
import { getScoreSaberIdFromIdOrURL } from "./utils/scoreSaberUrl"
import { formatAcc } from "./utils/index"
import { roundNumber } from "@utils/math"


const AMOUNT_OF_SCORES = 20


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
        await ScoreSaberDataCache.initialize()
        await PlayerTriggerEvents.initialize()

        // Start historic fetcher for any pending fetch scores from scoresaber accounts
        HistoricScoreFetcher.startFetcher()


        this.addCustomCron("*/20 * * * *", async () => {
            console.log("cron running each 20 min...")
            await PeriodicScoreFetcher.startPeriodicFetch()
        })

         await PlayerProfileUpdater.startProfileUpdater()
         this.addCustomCron("*/25 * * * *", async () => {
             console.log("cron running each 25 min...")
             await PlayerProfileUpdater.startProfileUpdater()
        })


        CommandManager.newAdminCommand("lista_users_ss", null, async (message: Message, args) => {

            const players = await SSPlayer.findAll({ include: User, order: [["name", "ASC"]] })

            let userListTxt = "**__Lista de usuarios con ScoreSaber vinculado:__**\n"
            for(const player of players) {
                userListTxt += `**User:** ${player.User.username}. **SS:** ${player.name}. **URL:** <${player.scoreSaberURL()}>\n`
            }
            message.reply(userListTxt)

        }, "Mostrar una lista de usuarios del server con su cuenta de ScoreSaber vinculada.", "BeatSaber")



        CommandManager.newAdminCommand("ss_de_user", "<discord user id>", async (message: Message, args) => {

            const user = await User.findByPk(args[0])
            if(!user) {
                message.reply("No se encontró un usuario de Discord en el server con ese id!")
                return
            }

            const player = await SSPlayer.findOne({ where: { discordUserId: args[0] } })
            if(!player) {
                message.reply("El usuario seleccionado no tiene su cuenta de ScoreSaber vinculada!")
                return
            }

            message.reply(`Cuenta de ScoreSaber de __${user.username}__: <${player.scoreSaberURL()}> (**${player.name}**)`)

        }, "Mostrar la cuenta de ScoreSaber vinculada a un User de Discord.", "BeatSaber")


        CommandManager.newAdminCommand("user_de_ss", "<scoresaber id>", async (message: Message, args) => {

            const player = await SSPlayer.findOne({ include: User, where: { id: args[0] } })

            if(!player) {
                message.reply("No se encontró el jugador de ScoreSaber registrado en el server con el id ingresado!")
                return
            }
            if(!player.User) {
                message.reply("La cuenta de ScoreSaber está registrada pero no se encontró el usuario de Discord (revisar, raro).")
                return
            }

            message.reply(`Usuario en Discord vinculado a la cuenta ScoreSaber _${player.name}_: **${player.User.username}** (discord id ${player.User.discordUserId})`)

        }, "Mostrar la cuenta de Discord vinculada a una cuenta de ScoreSaber.", "BeatSaber")


        CommandManager.newCommand("linkear", "<scoresaber id o url>", async (message: Message, args) => {
            // Validar param
            const scoreSaberId = getScoreSaberIdFromIdOrURL(args[0])

            if(!scoreSaberId) {
                message.reply("Ingresa un ID de scoresaber o una URL de jugador de ScoreSaber válido.")
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


        CommandManager.newAdminCommand("linkear_admin", "<discord user id> <scoresaber id or url>", async (message: Message, args) => {
            // Validar params
            const discordUserId = args[0]

            if(!discordUserId || !/^\d{5,20}$/.test(discordUserId)) {
                message.reply("Ingresa un id de Discord numérico valido de entre 5 y 20 dígitos.")
                return
            }

            const scoreSaberId = getScoreSaberIdFromIdOrURL(args[1])
            if(!scoreSaberId) {
                message.reply("Ingresa un ID de scoresaber o una URL de jugador de ScoreSaber válido.")
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


        CommandManager.newCommand("deslinkear", null, async (message: Message, args) => {

            const accountManager = new ScoreSaberAccountManager()
            const ssPlayer = await accountManager.unlinkScoreSaberAccountFromUser(message.author.id)

            if(ssPlayer) {
                message.reply(`La cuenta de ScoreSaber **${ssPlayer.name}** (ID ${ssPlayer.id}) se te desvinculó correctamente!`)
            } else {
                message.reply(accountManager.getErrorMsg())
            }

        }, "Desvincular la cuenta de ScoreSaber de tu cuenta de Discord.", "BeatSaber")


        CommandManager.newAdminCommand("deslinkear_admin", "<discord user id>", async (message: Message, args) => {
            
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



        CommandManager.newCommand("menciones_hitos", null, async (message: Message, args) => {

            const ssPlayer = await SSPlayer.scope({ method: ["withDiscordUserId", message.author.id] }).findOne()

            if(!ssPlayer) {
                message.reply(`Tu cuenta de scoresaber no está vinculada con tu cuenta de discord. Vinculala con /linkear <id scoresaber>.`)
                return
            }

            ssPlayer.milestoneAnnouncements = !ssPlayer.milestoneAnnouncements
            await ssPlayer.save()

            if(ssPlayer.milestoneAnnouncements) {
                message.reply("Se han activado las menciones de hitos de otros jugadores que involucren a tu usuario.")
            } else {
                message.reply("Se han desactivado las menciones de hitos de otros jugadores que involucren a tu usuario.")
            }
            

        }, "Activar/desactivar las menciones en los anuncios de hitos de otros jugadores que involucran a tu usuario.", "BeatSaber")
        


        CommandManager.newCommand("menor_acc", null, async (message: Message, args) => {


            // get scoresaber player id
            const ssPlayer = await SSPlayer.scope({ method: ["withDiscordUserId", message.author.id] }).findOne()

            if(!ssPlayer) {
                message.reply(`Tu cuenta de scoresaber no está vinculada con tu cuenta de discord. Vinculala con /linkear <id scoresaber>.`)
                return
            }

            const scores = await PlayerScore.scope({ method: ["leastAccuracy", ssPlayer.id, AMOUNT_OF_SCORES] }).findAll()
            
            let list = "**__Top "+AMOUNT_OF_SCORES+" scores con menos accuracy de "+ssPlayer.name+":__**\n"
            for(const score of scores) {
                if(!score.Leaderboard) continue
                console.log(score.toJSON())
                list += "**" + formatAcc(score.accuracy) + "** ("+roundNumber(score.pp, 1)+"pp) en " + score.Leaderboard.readableMapDesc() + "\n"
            }

            await Discord.sendLongMessageToChannel(<TextChannel>message.channel, list)

        }, "Ver tu top "+AMOUNT_OF_SCORES+" scores de maps ranked con menos accuracy.", "BeatSaber")




    }
    
}