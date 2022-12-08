import { Message } from "discord.js"
import { CommandType } from "./enums"


export type CommandActionFunction = (...args: any) => any

/**
 * A command, which is the medium of interaction with this bot. These commands are "classic" plain text discord message commands, not Discord Slash Commands.
 */
export interface BotCommand {
    type: CommandType,
    groupName: string,
    name: string,
    args?: string,
    description?: string,
    //commandAction: CommandActionFunction,
    /** Only for public commands. Id of channel if restricted. */
    restrictedChannelId?: string
}

/**
 * The metadata containing Discord Message included in every bot-commander command parse, so we can access said Message in the final onCommand handlers.
 */
 export interface CommandMetadata {
    message: Message
}


export type ScriptClass = new (...args: any) => Script // some weird type to represent a "newable". (constructor function that constructs a Script)


export interface UserI {
    discordUserId: string
    /** This is the discord username (which cannot be changed) */
    username: string
    joinDate: Date
    isPresent: boolean
    leaveDate: Date
    isAdmin: boolean
}


export interface CommandDefinition {
    isAdmin?: boolean,
    /** dsfsd */
    cmd: string,
    args?: string,
    action: string,
    description?: string,
    groupName?: string,
    restrictedChannelId?: string
}

export interface Script {
    name: string,
    commands?: CommandDefinition[],
    onUserMesssage?: (args: any) => any,
    initDbModels?: () => void,
    onInitialized(): void
}