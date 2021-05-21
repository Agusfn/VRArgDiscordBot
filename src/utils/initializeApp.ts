import * as dotenv from "dotenv"
import { initialize as initializeDb } from "@database/initialize"
import discordClient from "./discordClient"

export const initializeApp = async () => {

    /**
     * Initialize dotenv
     */
    dotenv.config()

    /**
     * Initialize database
     */
    await initializeDb()


    discordClient.login(process.env.BOT_TOKEN)


}