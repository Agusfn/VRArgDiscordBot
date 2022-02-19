import { SSPlayer } from "../model/index"
import logger from "@utils/logger"
import { ScoreSaberAPI } from "../utils/index"
import { PlayerTriggerEvents } from "./PlayerTriggerEvents"
import { PlayerPerformanceInfo, SSPlayerI } from "../ts"


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

            if(process.env.DEBUG == "true") {
                logger.info(`Profile Updater: Updating ScoreSaber profile for ScoreSaber player ${player.name}`)
            }

            previousPerformances.push(player.getPerformanceInfo())

            const oldPlayerData: SSPlayerI = player.toJSON()

            const ssPlayerData = await api.getPlayer(player.id)
            player.fillWithSSPlayerData(ssPlayerData)
            await player.save()

            newPerformances.push(player.getPerformanceInfo())

            // (async) send player updated profile event to PlayerTriggerEvents
            PlayerTriggerEvents.onPlayerUpdateProfile(player, oldPlayerData)
        }

        // (async) Call on all players update performance info at once for accurate rank comparison.
        PlayerTriggerEvents.onAllPlayersUpdatePerformanceInfo(previousPerformances, newPerformances)

        this.updaterRunning = false

    }


}