import { Message } from "discord.js"

export type CommandActionFunction = (...args: any) => any

export interface RegisteredCommand {
    name: string, // name of command. ex: "help"
    action: CommandActionFunction // function to be excecuted when command is triggered
}

/**
 * The metadata containing Discord Message included in every bot-commander command parse, so we can access said Message in the final onCommand handlers.
 */
 export interface CommandMetadata {
    message: Message
}