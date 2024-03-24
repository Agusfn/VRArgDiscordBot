import logger from "@utils/logger"
import { PlayerTriggerEvents } from "./PlayerTriggerEvents"
import { logException } from "@utils/other"
import { ScoreSaberAPI } from "@services/ScoreSaber/ScoreSaberAPI"
import { SSPlayer } from "../models"
import { PlayerPerformanceInfo } from "../types"
import { UserManager } from "@scripts/core-script/services/UserManager"


/**
 * Class for updating ScoreSaber Player profiles periodically and submit their new statuses to PlayerTriggerEvents.
 */
export class PlayerProfileUpdater {

    constructor(private playerTriggerEvents: PlayerTriggerEvents) {

    }


    /**
     * Whether the fetcher is runnning
     */
    private updaterRunning: boolean = false

    
    /**
     * Start the ScoreSaber Player profile update, updating every SSPlayer with their Discord account linked.
     * @returns 
     */
    public async checkPlayersProfileUpdates() {

        try {

            if(this.updaterRunning) {
                logger.warn(`Profile Updater: Player Profile Updater is already running. `)
                return
            }
            this.updaterRunning = true
    
            // get all players with discord linked
            const playersToFetch = await SSPlayer.scope("discordAccountLinked").findAll()
            const api = new ScoreSaberAPI()
    
            const previousPerformances: PlayerPerformanceInfo[] = []
            const newPerformances: PlayerPerformanceInfo[] = []
    
            for(const player of playersToFetch) {
    
                if(!UserManager.isUserPresent(player.discordUserId)) continue; // ignore players whose users are not present in the server

                if(process.env.DEBUG == "true") {
                    logger.info(`Profile Updater: Updating ScoreSaber profile for ScoreSaber player ${player.name}`)
                }
    
                previousPerformances.push(player.getPerformanceInfo())
    
                const oldPlayerData: SSPlayer = player.toJSON()
    
                const ssPlayerData = await api.getPlayer(player.id)
                player.fillWithSSPlayerData(ssPlayerData)
                await player.save()
    
                newPerformances.push(player.getPerformanceInfo())
    
                // (async) send player updated profile event to PlayerTriggerEvents
                this.playerTriggerEvents.onPlayerUpdateProfile(player, oldPlayerData)
            }
    
            // (async) Call on all players update performance info at once for accurate rank comparison.
            this.playerTriggerEvents.onAllPlayersUpdatePerformanceInfo(previousPerformances, newPerformances)
    
            this.updaterRunning = false

        } catch(error: any) {
            logger.error("Error ocurred runnning player profile updater. This call to player profile updater was stopped.")
            logger.error(error?.stack || error);
            this.updaterRunning = false
        }

        

    }


}