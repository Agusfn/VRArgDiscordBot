import { SSPlayer } from "../../model/index"
import logger from "@utils/logger"
import { ScoreSaberAPI } from "../../utils/index"
import { PlayerEventsHandler } from "../PlayerEventsHandler"
import { PlayerPerformanceInfo, SSPlayerI } from "../../ts"
import { logException } from "@utils/other"
import { UserManager } from "@lib/UserManager"
import Cron from "./Cron"


/**
 * Class for updating ScoreSaber Player profiles periodically and submit their new statuses to Player TriggerEvents.
 */
export class PlayerProfileUpdaterCron extends Cron {

    private ssApi = new ScoreSaberAPI();

    constructor(cronExp: string) {
        super(cronExp);
    }

    /**
     * Start the ScoreSaber Player profile update, updating every SSPlayer with their Discord account linked.
     * @returns 
     */
    protected async tick() {

        try {

            if(this.running) {
                logger.warn(`Profile Updater: Player Profile Updater is already running. `)
                return
            }
            this.running = true
    
            // get all players with discord linked
            const playersToFetch = await SSPlayer.scope("discordAccountLinked").findAll()
    
            const previousPerformances: PlayerPerformanceInfo[] = []
            const newPerformances: PlayerPerformanceInfo[] = []
    
            for(const ssPlayer of playersToFetch) {
    
                if(!UserManager.isUserPresent(ssPlayer.discordUserId)) continue; // ignore players whose users are not present in the server

                logger.debug(`Profile Updater: Updating ScoreSaber profile for ScoreSaber player ${ssPlayer.name}`)
    
                previousPerformances.push(ssPlayer.getPerformanceInfo())
    
                const oldPlayerData: SSPlayerI = ssPlayer.toJSON()
    
                const ssPlayerData = await this.ssApi.getPlayer(ssPlayer.id)
                ssPlayer.fillWithSSPlayerData(ssPlayerData)
                await ssPlayer.save()
    
                newPerformances.push(ssPlayer.getPerformanceInfo())
    
                // (async) send player updated profile event to Player TriggerEvents
                PlayerEventsHandler.onPlayerUpdateProfile(ssPlayer, oldPlayerData)
            }
    
            // (async) Call on all players update performance info at once for accurate rank comparison.
            PlayerEventsHandler.onAllPlayersUpdatePerformanceInfo(previousPerformances, newPerformances)
    
            this.running = false

        } catch(error) {
            logger.error("Error ocurred runnning player profile updater. This call to player profile updater was stopped.")
            logException(error)
            this.running = false
        }

        

    }


}