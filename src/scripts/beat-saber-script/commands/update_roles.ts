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
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), // Mods or higher
            
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


    const players = await SSPlayer.scope("getArgentinianPlayers").findAll();

        if (players.length === 0) {
            logger.info("Player Role Updater: No players found.");
            return;
        }

        logger.info(`Player Role Updater: Found ${players.length} players.`);

        for (const player of players) {
            if (!player.User.isPresent) continue;

            const countryRank = player.countryRank;
            const discordUserId = player.discordUserId;

            // Fetch the member from the guild
            const member = await interaction.guild.members.fetch(discordUserId);

            // Modify roles based on countryRank
            const rolesToAdd = [];
            const rolesToRemove = [idRoleTop1, idRoleTop5, idRoleTop10, idRoleTop15];

            if (countryRank === 1) {
                rolesToAdd.push(idRoleTop1);
            } else if (countryRank <= 5) {
                rolesToAdd.push(idRoleTop5);
            } else if (countryRank <= 10) {
                rolesToAdd.push(idRoleTop10);
            } else if (countryRank <= 15) {
                rolesToAdd.push(idRoleTop15);
            }

            // Add and remove roles accordingly
            await member.roles.remove(rolesToRemove);
            await member.roles.add(rolesToAdd);
        }

        logger.info("Player Role Updater: Roles updated successfully.");
}