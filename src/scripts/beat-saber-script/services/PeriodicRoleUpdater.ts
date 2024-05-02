import logger from "@utils/logger"
import { SSPlayer } from "../models"

export async function PeriodicRoleUpdater (client: any) {
    const guild = await client.guild

    const idRoleTop1 = process.env.TOP_1_ROLE_ID
    const idRoleTop5 = process.env.TOP_5_ROLE_ID
    const idRoleTop10 = process.env.TOP_10_ROLE_ID
    const idRoleTop15 = process.env.TOP_15_ROLE_ID

    // Get all players with their Discord account linked
    const top1Player = await SSPlayer.scope("getArgentinianPlayerTop1").findAll();
    const top5Players = await SSPlayer.scope("getArgentinianPlayerTop5").findAll();
    const top10Players = await SSPlayer.scope("getArgentinianPlayerTop10").findAll();
    const top15Players = await SSPlayer.scope("getArgentinianPlayerTop15").findAll();

    const rolesToRemove = [idRoleTop1, idRoleTop5, idRoleTop10, idRoleTop15];

    // Assign roles to players
    await assignRolesToPlayers(top1Player, idRoleTop1, guild, rolesToRemove)
    await assignRolesToPlayers(top5Players, idRoleTop5, guild, rolesToRemove)
    await assignRolesToPlayers(top10Players, idRoleTop10, guild, rolesToRemove)
    await assignRolesToPlayers(top15Players, idRoleTop15, guild, rolesToRemove)

    logger.info("Roles updated.")
}

export async function assignRolesToPlayers(players: SSPlayer[], roleId: string, guild: any, roleToRemove: string[]) {
    for(const player of players) {
        if(!player.User?.isPresent) continue

        const discordUserId = player.discordUserId
        const member = await guild.members.cache.get(discordUserId)

        await member.roles.remove(roleToRemove);

        await member.roles.add(roleId);
    }
}