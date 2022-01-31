import { SSAccount } from "../model/index"
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
     */
    public async linkScoreSaberAccountToUser(discordUserId: string, scoreSaberId: string): Promise<SSAccount> {

        // Check if user has already an account linked to them
        const currentAccount = await SSAccount.findOne({ where: { discordUserId: discordUserId } })

        if(currentAccount) {
            this.errorMessage = `Ya tenés la cuenta de ScoreSaber _${currentAccount.name}_ (id ${currentAccount.id}) vinculada, no podés vincular otra! `
            return null
        }
        
        const existingAccount = await SSAccount.findByPk(scoreSaberId)

        // Check if this account is already occupied by another User
        if(existingAccount && existingAccount.discordUserId != null) {
            this.errorMessage = `La cuenta ingresada _${existingAccount.name}_ ya está siendo ocupada por otro usuario del servidor.`
            return null
        } 
        
        let ssAccount: SSAccount

        if(existingAccount) {
            // Link existing ScoreSaber account
            existingAccount.discordUserId = discordUserId
            existingAccount.linkedDate = new Date()
            await existingAccount.save()

            ssAccount = existingAccount
        } else {

            // Fetch from API
            const api = new ScoreSaberAPI()
            let ssPlayer: Player
            try {
                ssPlayer = await api.getPlayer(scoreSaberId)
            } catch(error) {
                this.errorMessage = "Ocurrió un error obteniendo la información del jugador."
                return null
            }

            if(!ssPlayer) {
                this.errorMessage = "No se encontró la cuenta de ScoreSaber solicitada con el id ingresado."
                return null
            }

            ssAccount = SSAccount.build({
                discordUserId: discordUserId,
                linkedDate: new Date()
            })
            ssAccount.fillWithSSPlayerData(ssPlayer)
            await ssAccount.save()

        }

        // Start fetching this new player's scores
        await HistoricScoreFetcher.addPlayerToFetchQueue(ssAccount.id)

        return ssAccount 
    }



    /**
     * Unlink the ScoreSaber account from a given User, given its discord user id.
     * @param discordUserId 
     * @param scoreSaberId 
     */
    public async unlinkScoreSaberAccountFromUser(discordUserId: string): Promise<SSAccount> {

        // check user has linked scoresaber account
        const ssAccount = await SSAccount.findOne({where: { discordUserId: discordUserId }})

        if(!ssAccount) {
            this.errorMessage = "No tenés una cuenta de ScoreSaber vinculada a tu cuenta!"
            return null
        }

        ssAccount.discordUserId = null
        await ssAccount.save()

        return ssAccount
    }



}