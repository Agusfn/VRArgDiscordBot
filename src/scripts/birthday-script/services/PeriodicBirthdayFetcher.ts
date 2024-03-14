import logger from "@utils/logger"
import { logException } from "@utils/other"
import { ScoreSaberAPI } from "@services/ScoreSaber/ScoreSaberAPI"
import { PlayerBirthday } from "../models"
import { UserManager } from "@scripts/core-script/services/UserManager"



export class PeriodicBirthdayFetcher {

    /**
     * Whether the fetcher is runnning
     */
    private fetchRunning: boolean = false

    constructor(private birthdayAnnouncements: any) {

    }



    /**
     * Start ScoreSaber periodic Score fetching for all SS Players with their Discord user linked.
     * @returns 
     */
    public async checkUsersBirthdays() {

        try {

            if(this.fetchRunning) {
                logger.warn(`Birthday Fecher: Periodic Birthday Fetcher is already running. `)
                return
            }

            // fetch users with birthday today
            const usersBirthdays = await PlayerBirthday.scope("getAllBirthdays").findAll()

            const usersWithBirthdayToday = usersBirthdays.filter((user) => {
                const today = new Date()
                return user.birthday.getDate() == today.getDate() && user.birthday.getMonth() == today.getMonth()
            })

            // Testing
            // const usersWithBirthdayToday = usersBirthdays

            if(usersWithBirthdayToday.length == 0) {
                logger.info("Birthday fetcher: No users with birthday today.")
                return
            } else {
                logger.info(`Birthday fetcher: Found ${usersWithBirthdayToday.length} users with birthday today.`)
            }

            for(const user of usersWithBirthdayToday) {
                
                this.birthdayAnnouncements.announceBirthday(user)
            }

           

        } catch (error: any) {
            logger.error("Error ocurred runnning periodic score fetcher. This call to periodic fetcher was stopped.")
            logger.error(error?.stack || error);
            this.fetchRunning = false
        }

        

    }


    
}