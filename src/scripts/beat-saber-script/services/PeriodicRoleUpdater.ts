import logger from "@utils/logger"
import { SSPlayer } from "../models"

export async function PeriodicRoleUpdater (client: any) {
    const guild = await client.guild


    const idRoleTop1 = process.env.TOP_1_ROLE_ID
    const idRoleTop5 = process.env.TOP_5_ROLE_ID
    const idRoleTop10 = process.env.TOP_10_ROLE_ID
    const idRoleTop15 = process.env.TOP_15_ROLE_ID


    // Get all players with their Discord account linked
    const players = await SSPlayer.scope("getArgentinianPlayers").findAll()

    if(players.length == 0) {
        logger.info("Player Role Updater: No players found.")
        return
    } else {
        logger.info(`Player Role Updater: Found ${players.length} players.`)
    }

    for(const player of players) {
        if(!player.User.isPresent) continue

        // Get player countryRank if country is set to AR
        const countryRank = player.countryRank

        const discordUserId = player.discordUserId
        // Get roles from user

        const member = await guild.members.cache.get(discordUserId)

        // Set roles depending on countryRank, removing other top roles
        if(countryRank == 1) {
            member.roles.add(idRoleTop1);
            member.roles.remove(idRoleTop5);
            member.roles.remove(idRoleTop10);
            member.roles.remove(idRoleTop15);
        } else if(countryRank <= 5 && countryRank > 1) {
            member.roles.add(idRoleTop5);
            member.roles.remove(idRoleTop1);
            member.roles.remove(idRoleTop10);
            member.roles.remove(idRoleTop15);
        } else if(countryRank <= 10 && countryRank > 5) {
            member.roles.add(idRoleTop10);
            member.roles.remove(idRoleTop1);
            member.roles.remove(idRoleTop5);
            member.roles.remove(idRoleTop15);
        } else if(countryRank <= 15 && countryRank > 10) {
            member.roles.add(idRoleTop15);
            member.roles.remove(idRoleTop1);
            member.roles.remove(idRoleTop5);
            member.roles.remove(idRoleTop10);
        } else {
            member.roles.remove(idRoleTop1);
            member.roles.remove(idRoleTop5);
            member.roles.remove(idRoleTop10);
            member.roles.remove(idRoleTop15);
        }
    }
}