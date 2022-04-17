import { SSPlayer } from "../model/index"
import { ScoreSaberAPI, Player } from "../utils/index"
import { HistoricScoreFetcher } from "./HistoricScoreFetcher"

/**
 * Class that handles the creation, update, enabling, and disabling of ScoreSaber accounts.
 */
export class ScoreSaberAccountManager {


    private errorMessage: string


    public getErrorMsg() {
        return this.errorMessage
    }


    /**
     * Link a ScoreSaber account (or ScoreSaberPlayer) to a user. The user must not have any currently linked SS account. Validation is performed.
     * @param discordUserId 
     * @param scoreSaberId 
     * @param isSelfUser If the discordUserId is the one making this request (for validation msg purposes)
     */
    public async linkScoreSaberAccountToUser(discordUserId: string, scoreSaberId: string, isSelfUser = true): Promise<SSPlayer> {

        // Check if the Discord user has already any ScoreSaber account linked to them
        const currentAccount = await SSPlayer.scope({ method: ["withDiscordUserId", discordUserId] }).findOne()

        if(currentAccount) {
            if(isSelfUser) {
                this.errorMessage = `Ya tenés la cuenta de ScoreSaber **${currentAccount.name}** (id ${currentAccount.id}) vinculada, no podés vincular otra! `
            } else {
                this.errorMessage = `El usuario de Discord seleccionado ya tiene la cuenta ScoreSaber **${currentAccount.name}** (ID ${currentAccount.id}) vinculada, no se puede vincular otra.`
            }
            return null
        }
        
        const existingPlayer = await SSPlayer.findByPk(scoreSaberId)

        // Check if this account is already occupied by another User
        if(existingPlayer && existingPlayer.discordUserId != null) {
            this.errorMessage = `La cuenta ScoreSaber ingresada **${existingPlayer.name}** ya está siendo ocupada por otro usuario del servidor.`
            return null
        } 
        
        let ssPlayer: SSPlayer

        if(existingPlayer) { // Player exists but is not linked to any discord user, so let's link to current user.

            // Link existing ScoreSaber account
            existingPlayer.discordUserId = discordUserId
            existingPlayer.linkedDate = new Date()
            await existingPlayer.save()

            ssPlayer = existingPlayer

        } else { // SSPlayer is not registered, so let's fetch and register it

            // Fetch player from API
            const api = new ScoreSaberAPI()
            let ssAPIPlayer: Player

            try {
                ssAPIPlayer = await api.getPlayer(scoreSaberId)
            } catch(error) {
                this.errorMessage = "Ocurrió un error obteniendo la información del jugador."
                return null
            }

            if(!ssAPIPlayer) {
                this.errorMessage = "No se encontró la cuenta de ScoreSaber solicitada con el id ingresado."
                return null
            }

            ssPlayer = SSPlayer.build({
                discordUserId: discordUserId,
                linkedDate: new Date()
            })
            ssPlayer.fillWithSSPlayerData(ssAPIPlayer)
            await ssPlayer.save()

        }

        // Start fetching this new player's scores
        await HistoricScoreFetcher.addPlayerToQueueAndStartFetcher(ssPlayer.id)

        return ssPlayer 
    }



    /**
     * Unlink the ScoreSaber account from a given User, given its discord user id.
     * @param discordUserId 
     * @param scoreSaberId 
     * @param isSelfUser If the discordUserId is the one making this request (for validation msg purposes)
     */
    public async unlinkScoreSaberAccountFromUser(discordUserId: string, isSelfUser = true): Promise<SSPlayer> {

        // check user has linked scoresaber account
        const ssPlayer = await SSPlayer.findOne({where: { discordUserId: discordUserId }})

        if(!ssPlayer) {
            if(isSelfUser) {
                this.errorMessage = "No tenés una cuenta de ScoreSaber vinculada a tu cuenta!"
            } else {
                this.errorMessage = `El usuario de Discord seleccionado no tiene ninguna cuenta de ScoreSaber vinculada.`
            }
            return null
        }

        ssPlayer.discordUserId = null
        ssPlayer.milestoneAnnouncements = false
        await ssPlayer.save()

        return ssPlayer
    }



}