import logger from "@utils/logger"
import { logException } from "@utils/other"
import { UserManager } from "@lib/UserManager"
import { PlayerBirthday } from "../model/PlayerBirthday"


/**
 * Class for updating ScoreSaber Player profiles periodically and submit their new statuses to PlayerTriggerEvents.
 */
export class PlayerProfileUpdater {

    /**
     * Whether the fetcher is runnning
     */
    private static updaterRunning: boolean = false

    
    /**
     * Start the ScoreSaber Player profile update, updating every SSPlayer with their Discord account linked.
     * @returns 
     */
    public static async startProfileUpdater() {

        try {

            if(this.updaterRunning) {
                logger.warn(`Profile Updater: Player Profile Updater is already running. `)
                return
            }
            this.updaterRunning = true
    
            // get all players with discord linked
            const user = await PlayerBirthday.scope("hasBirthdayToday").findAll()
            

            
    
            this.updaterRunning = false

        } catch(error) {
            logger.error("Error ocurred runnning player profile updater. This call to player profile updater was stopped.")
            logException(error)
            this.updaterRunning = false
        }

        

    }


}