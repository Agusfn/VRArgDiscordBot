
import { User } from "@models/index"
import { Discord } from "./Discord"
import DiscordJS from "discord.js"
import logger from "@utils/logger"


/**
 * This class manages the registration of members in the server into their own User entity in the bot, and synchronizes them upon bot startup.
 */
export class UserManager {

    /**
     * List that holds in runtime a cache of the current admins ids, to be able to quickly query whether a user is an admin or not.
     */
    private static adminUserIds: string[] = []

    /** Discord ids of all currently active users (present in the server) serving as a cache. */
    private static activeUserIds: string[] = [];

    /**
     * 
     * @param discordUserId The id of the user (discord user id).
     * @returns 
     */
    public static isUserIdActive(discordUserId: string): boolean {
        return this.activeUserIds.find(id => id == discordUserId) ? true : false;
    }
    
    public static addUserIdToActiveUsers(userId: string) {
        this.activeUserIds.push(userId);
    }

    public static removeUserIdFromActiveUsers(userId: string) {
        this.activeUserIds = this.activeUserIds.filter(id => id != userId);
    }

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

            if(member.user.bot) continue;
            this.addUserIdToActiveUsers(member.user.id); // add to user id cache

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

        for(const user of allUsers) {
            if(user.isAdmin) this.adminUserIds.push(user.discordUserId) // for caching purposes

            // Check and flag if user left the server
            if(!user.isPresent) continue
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
        logger.info("Cache of active user ids loaded. Count: " + this.activeUserIds.length);
    }


    /**
     * Create a new user in the database from a Discord User. Adds the admin ids to the list if the user is admin.
     * @param discordUser 
     */
    public static async createUserFromDiscordMember(discordMember: DiscordJS.GuildMember) {
        let isAdmin = (discordMember.user.id == process.env.MASTER_ADMIN_DISCORD_USER_ID) ? true : false
        await User.create({
            discordUserId: discordMember.user.id,
            username: discordMember.user.username,
            joinDate: discordMember.joinedAt,
            isPresent: true,
            leaveDate: null,
            isAdmin: isAdmin
        })
        if(isAdmin) {
            this.adminUserIds.push(discordMember.user.id)
        }
    }
    


    /**
     * Create new member User or update it's "isPresent" attr if already exists
     * @param discordMember 
     */
    public static async onMemberJoined(discordMember: DiscordJS.GuildMember) {

        if(discordMember.user.bot) return
        this.addUserIdToActiveUsers(discordMember.user.id);

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
        this.removeUserIdFromActiveUsers(discordMember.user.id);

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


    /**
     * Make a User admin.
     * @param user 
     */
    public static async makeUserAdmin(user: User) {
        user.isAdmin = true
        await user.save()
        this.adminUserIds.push(user.discordUserId)
    }


    /**
     * Make a User admin.
     * @param user 
     */
     public static async removeUserAdmin(user: User) {

        if(user.isMasterAdmin()) return // master admin can't stop being admin

        user.isAdmin = false
        await user.save()
        this.adminUserIds = this.adminUserIds.filter(id => id != user.discordUserId)

        console.log(this.adminUserIds)
    }


    /**
     * This is a check of the admin list cache if it's in sync with the admins in DB. This is called each time the admin command /admins is called.
     * It serves debug purposes, since the list should never go out of sync.
     * @param adminUsers 
     */
    public static checkAdminIdList(adminUsers: User[]) {

        // flags
        let userNotInList = false
        let idNotInUserList = false

        for(const user of adminUsers) {
            if(!this.adminUserIds.includes(user.discordUserId)) userNotInList = true
        }
        for(const adminId of this.adminUserIds) {
            if(!adminUsers.find(user => user.discordUserId == adminId)) idNotInUserList = true
        }

        if(!userNotInList && !idNotInUserList) return true // everything is ok
        else {
            if(userNotInList) {
                logger.warn("Admin Users were found which did not have their id cached in UserManager")
            }
            if(idNotInUserList) {
                logger.warn("User ids of admins were found cached in UserManager, but no corresponding User was found.")
            }
            return false
        }
    }


}