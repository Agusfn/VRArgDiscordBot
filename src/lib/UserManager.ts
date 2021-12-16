
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
            if(member.user.bot) continue

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
        for(const user of allUsers.filter(user => user.isPresent)) {
            const member = currentMembers.find(member => member.user.id == user.discordUserId && member.user.bot == false)
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
     * Create new member User or update it's "isPresent" attr if already exists
     * @param discordMember 
     */
    public static async onMemberJoined(discordMember: DiscordJS.GuildMember) {

        if(discordMember.user.bot) return

        const user = await User.findByPk(discordMember.user.id)
        if(user) {
            user.isPresent = true
            user.joinDate = new Date()
            await user.save()

            if(process.env.DEBUG == "true") {
                logger.info(`Marking user id ${discordMember.user.id} (${discordMember.user.username}) as present, since they re-joined.`)
            }

        } else {
            await this.createUserFromDiscordMember(discordMember)

            if(process.env.DEBUG == "true") {
                logger.info(`Creating new User for user id ${discordMember.user.id} (${discordMember.user.username}) who just joined.`)
            }

        }

    }


    /**
     * Update a user and mark that it has left.
     * @param userId 
     */
    public static async onMemberLeft(discordMember: DiscordJS.GuildMember) {
        
        if(discordMember.user.bot) return

        await User.update(
            { isPresent: false, leaveDate: new Date() }, 
            { where: { discordUserId: discordMember.user.id }}
        )

        if(process.env.DEBUG == "true") {
            logger.info(`Marked user id ${discordMember.user.id} (${discordMember.user.username}) absent since they left.`)
        }
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