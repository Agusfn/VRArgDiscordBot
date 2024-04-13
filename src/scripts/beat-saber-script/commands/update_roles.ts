import { DiscordCommand } from "@ts/interfaces";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { BeatSaberScript } from "../BeatSaberScript";
import { SSPlayer } from "../models";
import logger from "@utils/logger";
import { UserManager } from "@scripts/core-script/services/UserManager";

export default {
    data: new SlashCommandBuilder()
        .setName('update_roles')
        .setDescription("Get user roles")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers) // mods or higher,
        .addUserOption(option => option
            .setName('user')
            .setDescription('The user to get roles from')
            .setRequired(false)),
            
    async execute(script, interaction) {
        updateRoles(interaction)

        interaction.reply("Roles updated.")
    },
} as DiscordCommand<BeatSaberScript>;

export async function updateRoles (interaction: any) {

    const idRoleTop1 = process.env.TOP_1_ROLE_ID
    const idRoleTop5 = process.env.TOP_5_ROLE_ID
    const idRoleTop10 = process.env.TOP_10_ROLE_ID
    const idRoleTop15 = process.env.TOP_15_ROLE_ID


    // Get all players with their Discord account linked
    const players = await SSPlayer.scope("getAllPlayers").findAll()

    if(players.length == 0) {
        logger.info("Player Role Updater: No players found.")
        return
    } else {
        logger.info(`Player Role Updater: Found ${players.length} players.`)
    }

    for(const player of players) {
        // Get player countryRank if country is set to AR
        if(player.country == "AR") {
        const countryRank = player.countryRank

        const discordUserId = player.discordUserId
        // Get roles from user

        const member = await interaction.guild.members.fetch(discordUserId);

        // Set roles depending on countryRank, removing other top roles
        if(countryRank == 1) {
            member.roles.add(idRoleTop1);
            member.roles.remove(idRoleTop5);
            member.roles.remove(idRoleTop10);
            member.roles.remove(idRoleTop15);
        } else if(countryRank <= 5) {
            member.roles.add(idRoleTop5);
            member.roles.remove(idRoleTop1);
            member.roles.remove(idRoleTop10);
            member.roles.remove(idRoleTop15);
        } else if(countryRank <= 10) {
            member.roles.add(idRoleTop10);
            member.roles.remove(idRoleTop1);
            member.roles.remove(idRoleTop5);
            member.roles.remove(idRoleTop15);
        } else if(countryRank <= 15) {
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
}