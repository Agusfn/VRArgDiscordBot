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




