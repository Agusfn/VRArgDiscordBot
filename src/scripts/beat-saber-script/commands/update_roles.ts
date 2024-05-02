import { DiscordCommand } from "@ts/interfaces";
import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { BeatSaberScript } from "../BeatSaberScript";
import { SSPlayer } from "../models";
import logger from "@utils/logger";
import { UserManager } from "@scripts/core-script/services/UserManager";
import { assignRolesToPlayers } from "../services";

export default {
    data: new SlashCommandBuilder()
        .setName('update_roles')
        .setDescription("Get user roles")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers), // Mods or higher
            
    async execute(script, interaction) {
        updateRoles(interaction)
    },
} as DiscordCommand<BeatSaberScript>;

export async function updateRoles (interaction: any) {

    const idRoleTop1 = process.env.TOP_1_ROLE_ID
    const idRoleTop5 = process.env.TOP_5_ROLE_ID
    const idRoleTop10 = process.env.TOP_10_ROLE_ID
    const idRoleTop15 = process.env.TOP_15_ROLE_ID


    const top1Player = await SSPlayer.scope("getArgentinianPlayerTop1").findAll();
    const top5Players = await SSPlayer.scope("getArgentinianPlayerTop5").findAll();
    const top10Players = await SSPlayer.scope("getArgentinianPlayerTop10").findAll();
    const top15Players = await SSPlayer.scope("getArgentinianPlayerTop15").findAll();

    const guild = await interaction.guild

    const rolesToRemove = [idRoleTop1, idRoleTop5, idRoleTop10, idRoleTop15];

    await assignRolesToPlayers(top1Player, idRoleTop1, guild, rolesToRemove)
    await assignRolesToPlayers(top5Players, idRoleTop5, guild, rolesToRemove)
    await assignRolesToPlayers(top10Players, idRoleTop10, guild, rolesToRemove)
    await assignRolesToPlayers(top15Players, idRoleTop15, guild, rolesToRemove)

    logger.info("Roles updated.")

    interaction.reply("Roles updated.")
}