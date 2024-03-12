
import { User } from "../models/User"
import DiscordJS, { Collection, GuildMember } from "discord.js"
import logger from "@utils/logger"


/**
 * This class manages the registration of members in the server into their own User entity in the bot, and synchronizes them upon bot startup.
 */
export class UserManager {

    //////////////////
    // Static methods for present user cache (for accessing between all scripts) //

    /** Cache with discordUserIds of all present users (members of the server). */
    private static presentUserIds: string[] = [];

    /**
     * Check if a user is present on the server (by its discordUserId) by checking in local cached array.
     * @param discordUserId The id of the user (discord user id).
     * @returns 
     */
    public static isUserPresent(discordUserId: string): boolean {
        return this.presentUserIds.find(id => id == discordUserId) ? true : false;
    }
    
    public static addUserIdToPresentUsers(userId: string) {
        this.presentUserIds.push(userId);
    }

    public static removeUserIdFromPresentUsers(userId: string) {
        this.presentUserIds = this.presentUserIds.filter(id => id != userId);
    }

    //////////////


    /**
     * Synchronize all the users in the server with their User entity within this bot.
     * @param currentMembers Updated and whole list of current guild members
     */
    public async syncGuildMembers(currentMembers: Collection<string, GuildMember>) {

        // Create any non existing user
        const allUsers = await User.findAll()
        
        let newUsers = 0, returnedUsers = 0, usersLeft = 0

        // Create Users for non existing members and mark "present" previously left members.
        for(const [key, member] of currentMembers) {

            if(member.user.bot) continue;
            UserManager.addUserIdToPresentUsers(member.user.id); // add to user id cache

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

            // Check and flag if user left the server
            if(!user.isPresent) continue
            const member = currentMembers.find(member => member.user.id == user.discordUserId && member.user.bot == false)
            if(!member) {
                user.isPresent = false
                await user.save()
                usersLeft++
            }
        }

        if(newUsers > 0) {
            logger.info("Registered " + newUsers + " new users that were not previously registered.")
        }
        if(returnedUsers > 0) {
            logger.info("Marked 'present' " + returnedUsers + ' users that had previously left the server.')
        }
        if(usersLeft > 0) {
            logger.info("Marked 'absent' " + usersLeft + ' users that were not found in the server.')
        }
        logger.info("Cache of present user ids loaded. Count: " + UserManager.presentUserIds.length);
    }


    /**
     * Create a new user in the database from a Discord User. Adds the admin ids to the list if the user is admin.
     * @param discordUser 
     */
    public async createUserFromDiscordMember(discordMember: DiscordJS.GuildMember) {
        
        await User.create({
            discordUserId: discordMember.user.id,
            username: discordMember.user.username,
            joinDate: discordMember.joinedAt,
            isPresent: true,
            leaveDate: null,
            isAdmin: false
        })

    }
    

    /**
     * Upon a new member joining, create its new User or update its "isPresent" flag if it already existed
     * @param member 
     */
    public async createUserOnMemberJoin(member: DiscordJS.GuildMember) {

        if(member.user.bot) return
        UserManager.addUserIdToPresentUsers(member.user.id);

        const user = await User.findByPk(member.user.id)
        if(user) {
            user.isPresent = true
            user.joinDate = new Date()
            await user.save()

            if(process.env.DEBUG == "true") {
                logger.info(`Marking user id ${member.user.id} (${member.user.username}) as present, since they re-joined.`)
            }

        } else {
            await this.createUserFromDiscordMember(member)

            if(process.env.DEBUG == "true") {
                logger.info(`Creating new User for user id ${member.user.id} (${member.user.username}) who just joined.`)
            }

        }

    }

    /**
     * Update a user and mark that it has left, when it has left.
     * @param userId 
     */
    public async markAbsentUserOnMemberLeft(member: DiscordJS.GuildMember) {
        
        if(member.user.bot) return;

        UserManager.removeUserIdFromPresentUsers(member.user.id);

        const count = await User.update({ 
            isPresent: false, leaveDate: new Date() 
        }, { 
            where: { discordUserId: member.user.id }
        });
        
        if(count[0] > 0) {
            if(process.env.DEBUG == "true") {
                logger.info(`Marked user id ${member.user.id} (${member.user.username}) absent since they left.`)
            }
        } else {
            logger.warn(`Discord user ${member.user.id} (${member.displayName}) has left but it wasn't found in our User database, so we couldn't mark them absent.`);
        }
        
    }


}