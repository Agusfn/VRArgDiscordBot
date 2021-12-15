
import { User } from "@models/index"
import { Discord } from "./Discord"
import DiscordJS from "discord.js"
import logger from "@utils/logger"


export class UserManager {


    private static adminUserIds: string[]
    

    public static async initialize() {

        // Create any non existing user
        const currentMembers = await Discord.getGuild().members.fetch()
        const allUsers = await User.findAll()
        
        let newUsers = 0

        // Create Users for non existing members and update isPresent for previously left members.
        console.log("current members: ", currentMembers.size)
        currentMembers.forEach(async member => {
            const user = allUsers.find(user => user.discordUserId == member.user.id)
            console.log("user", user)
            if(user) {
                if(!user.isPresent) {
                    user.isPresent = true
                    await user.save()
                }
            } else {
                await this.createUserFromDiscordUser(member)
                newUsers++
            }
        })



        logger.info("Initialized users! Registered " + newUsers + " new users.")
    }


    /**
     * Create a new user in the database from a Discord User
     * @param discordUser 
     */
    public static async createUserFromDiscordUser(discordMember: DiscordJS.GuildMember) {
        await User.create({
            discordUserId: discordMember.user.id,
            joinDate: discordMember.joinedAt,
            isPresent: true,
            leaveDate: null,
            isAdmin: (discordMember.user.id == process.env.MASTER_ADMIN_DISCORD_USER_ID) ? true : false
        })
    }



    /**
     * Check if a given user by its id is admin
     * @param userId 
     * @returns 
     */
    public static isAdmin(userId: string) {
        return this.adminUserIds.includes(userId)
    }


}