import { Script } from "@core/Script"
import { CacheType, ChatInputCommandInteraction, ClientEvents, Events, SlashCommandBuilder } from "discord.js"

/**
 * Object that contains the definition and execution callback for a Discord command within our application.
 */
export interface DiscordCommand<T extends Script> {
    /** This is the important piece of data that is sent to Discord in order to register a new command. */
    data: SlashCommandBuilder,
    /** Excecution function for the command. */
    execute: (script: T, interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>,
    /** Script reference where this command belongs to, to add context for the command. */
    script?: Script
}

/**
 * Object that contains the definition and execution callback for a Discord event within our application.
 */
export interface DiscordEvent<T extends Script> {
    /** The specific type of the event. */
    name: keyof ClientEvents,
    /** Whether to call this only once, or each time it occurs. */
    once: boolean,
    /** The execution function for the event. Its arguments are determined by the event type. */
    execute: (script: T, ...args: any) => Promise<void>
}


export interface UserI {
    discordUserId: string
    /** This is the discord username (which cannot be changed) */
    username: string
    joinDate: Date
    isPresent: boolean
    leaveDate: Date
    isAdmin: boolean
}

