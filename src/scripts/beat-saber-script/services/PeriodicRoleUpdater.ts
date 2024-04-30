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

        // Modify roles based on countryRank
        const rolesToAdd = [];
        const rolesToRemove = [idRoleTop1, idRoleTop5, idRoleTop10, idRoleTop15];

        if (countryRank === 1) {
            rolesToAdd.push(idRoleTop1);
        } else if (countryRank <= 5 && countryRank > 1) {
            rolesToAdd.push(idRoleTop5);
        } else if (countryRank <= 10 && countryRank > 5) {
            rolesToAdd.push(idRoleTop10);
        } else if (countryRank <= 15 && countryRank > 10) {
            rolesToAdd.push(idRoleTop15);
        }

        // Add and remove roles accordingly
        await member.roles.remove(rolesToRemove);
        await member.roles.add(rolesToAdd);
    }
}