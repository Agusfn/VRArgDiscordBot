import { Script } from "@core/Script"
import { CacheType, ChatInputCommandInteraction, ClientEvents, SlashCommandBuilder } from "discord.js"

/**
 * Object that contains the definition and execution callback for a Discord command within our application.
 */
export interface DiscordCommand<T extends Script> {
    /** This is the important piece of data that is sent to Discord in order to register a new command. */
    data: SlashCommandBuilder,
    /** Excecution function for the command. */
    execute: (script: T, interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>,
    /** Commands cooldown in seconds before being able to use it again. */
    cooldownSecs?: number,

    /** Script reference where this command belongs to, to add context for the command (do not assign this value on the command file). */
    script?: Script,
}

/**
 * Object that contains the definition and execution callback for a Discord event within our application.
 */
export interface DiscordEvent<T extends Script, Event extends keyof ClientEvents> {
    /** The specific type of the event. */
    name: Event,
    /** Whether to call this only once, or each time it occurs. */
    once: boolean,
    /** The execution function for the event. Its arguments are determined by the event type. */
    execute: (script: T, ...args: ClientEvents[Event]) => Promise<void>
}