
import { User } from "@models/index"
import { Discord } from "./Discord"
import DiscordJS from "discord.js"
import logger from "@utils/logger"


export class UserManager {


    private static adminUserIds: string[]
    

    /**
     * Synchronize all the users in the server with their User entity within this bot.
     */
    public static async initialize() {

        // Create any non existing user
        const currentMembers = await Discord.getGuild().members.fetch()
        const allUsers = await User.findAll()
        
        let newUsers = 0, returnedUsers = 0, usersLeft = 0

        // Create Users for non existing members and mark "present" previously left members.
        for(const [key, member] of currentMembers) {
            const user = allUsers.find(user => user.discordUserId == member.user.id)
            if(user) {
                if(!user.isPresent) {
                    user.isPresent = true
                    await user.save()
                    returnedUsers++
                }
            } else {
                await this.createUserFromDiscordMember(member)
                newUsers++
            }
        }

        // Mark "left" all registered Users that don't have their member in the server
        for(const user of allUsers) {
            const member = currentMembers.find(member => member.user.id == user.discordUserId)
            if(!member) {
                user.isPresent = false
                await user.save()
                usersLeft++
            }
        }

        logger.info("Initialized UserManager!")
        if(newUsers > 0) {
            logger.info("Registered " + newUsers + " new users that were not previously registered.")
        }
        if(returnedUsers > 0) {
            logger.info("Marked 'present' " + returnedUsers + ' users that had previously left the server.')
        }
        if(usersLeft > 0) {
            logger.info("Marked 'absent' " + usersLeft + ' users that were not found in the server.')
        }
    }


    /**
     * Create a new user in the database from a Discord User
     * @param discordUser 
     */
    public static async createUserFromDiscordMember(discordMember: DiscordJS.GuildMember) {
        await User.create({
            discordUserId: discordMember.user.id,
            username: discordMember.user.username,
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