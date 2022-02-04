
import { CommandType } from "@ts/enums"
import { BotCommand, CommandActionFunction, CommandMetadata } from "@ts/interfaces"
import { Message, User } from "discord.js"
import bot = require("bot-commander")
import logger from "@utils/logger"
import { COMMAND_PREFIX } from "@utils/configuration"
import { Discord } from "./Discord"
import { UserManager } from "./UserManager"

/**
 * Help command aliases. This is a special type of command that will list all commands to the user
 * according to the type of command, permissions, and channel of restriction of each, if any.
 * This command may not be registered with CommandManager, it's handled directly by it.
 */
const helpCommands = ["ayuda", "help"]

const maxCommandLength = 30


/**
 * Class that handles the registration and submition of all commands in the discord server for this bot.
 * These commands are all "classic" plain text discord message commands.
 */
export class CommandManager {


    /**
     * List of all registered commands.
     */
    private static commands: BotCommand[] = []


    /**
     * Register a new public command. Commands should be registered on initialization of the bot/Scripts, not after at runtime.
     * @param commandName The command name, without slash. Must be alphanumeric + underscore. Ex: my_cmd_3 (would be called with /my_cmd_3)
     * @param args The arguments, in the syntax of bot-commander library. https://github.com/friscoMad/botCommander#specify-the-argument-syntax
     * @param commandAction 
     * @param description 
     * @param restrictedChannelId 
     */
    public static newCommand(commandName: string, args: string | null, commandAction: CommandActionFunction, description?: string, restrictedChannelId?: string) {
        this.registerCommand(CommandType.PUBLIC, commandName, args, commandAction, description, restrictedChannelId)
    }


    /**
     * Register a new admin command. Commands should be registered on initialization of the bot/Scripts, not after at runtime.
     * @param commandName The command name, without slash. Must be alphanumeric + underscore. Ex: my_cmd_3 (would be called with /my_cmd_3)
     * @param args The arguments, in the syntax of bot-commander library. https://github.com/friscoMad/botCommander#specify-the-argument-syntax
     * @param commandAction 
     * @param description 
     */
    public static newAdminCommand(commandName: string, args: string | null, commandAction: CommandActionFunction, description?: string) {
        this.registerCommand(CommandType.ADMIN, commandName, args, commandAction, description)
    }


    /**
     * Register new command. For internal use of this class.
     */
    private static registerCommand(commandType: CommandType, commandName: string, args: string | null, commandAction: CommandActionFunction, description?: string, restrictedChannelId?: string) {

        if(!this.isValidCmdName(commandName)) {
            throw new Error("Error registering command. Command name '" + commandName + "' is invalid.")
        }

        if(this.commands.find(command => command.name == commandName)) {
            throw new Error("Command '"+commandName+"' is already registered. It may be a base command or it was already registered by another script.")
        }

        // Push new command to our commands list
        this.commands.push({
            type: commandType,
            name: commandName,
            args: args,
            description: description,
            //commandAction: commandAction, // to-do: check if necessary
            restrictedChannelId: restrictedChannelId
        })

        // Register the new command in bot-commander, with its action handler
        const command = bot.command(args ? commandName+" "+args : commandName, null)
        if(description) {
            command.description(description)
        }
        command.showHelpOnEmpty()
        .action( async (metadata: CommandMetadata, ...params: any) => { // register the handler function for this command in bot-commander
            try {
                await commandAction(metadata.message, params) 
            } catch(error: any) {
                logger.error(error)
                logger.error(error?.stack)
                metadata.message.reply("Ocurrió un error ejecutando el comando. Revisa el log para más información.")
            }
        })


        /*if(process.env.DEBUG == "true") {
            logger.info("Registered command /" + commandName + "!")
        }*/

    }



    /**
     * This is the handler called when a user submits a command-like text message in any channel. 
     * Shall not be called from other parts of the app other than on initialization.
     */
    public static onUserSubmitCommand(message: Message) {
        
        const userCommand = this.fetchCmdNameFromMsg(message.content)
        const command = this.commands.find(command => command.name == userCommand)

        // Ignore if no recognized command
        if(command == null && !helpCommands.includes(userCommand)) {
            return
        }

        const isInAdminChannel = (UserManager.isAdmin(message.author.id) && message.channel.id == process.env.DISCORD_CHANNEL_ID_ADMIN)

        // Override for "help" command
        if(helpCommands.includes(userCommand)) {
            if(isInAdminChannel) {
                message.reply(this.getAdminCommandList())
            } else {
                message.reply(this.getPublicCommandList())
            }
            return
        }

        const executeCommand = () => {
            const metadata: CommandMetadata = { message: message } // Include Discord Message object into the bot-commander command metadata so we can have it in the handler.
            bot.parse(message.content, metadata) // parse and execute command with bot-commander
        }

        if(command.type == CommandType.PUBLIC) {
            if(command.restrictedChannelId == null || command.restrictedChannelId == message.channel.id || isInAdminChannel) { // corresponding channel or admins in admin channel
                executeCommand()
            } else {
                const channel = Discord.getInstance().channels.cache.find(channel => channel.id == command.restrictedChannelId)
                if(channel) {
                    message.reply("Este comando sólo puede ser usado en <#"+channel.id+">")
                } else { // shouldn't happen
                    message.reply("Este comando no puede usarse en este canal (no se encontró el canal donde puede ser usado).")
                }
            }
        } else { // admin command
            if(isInAdminChannel) {
                executeCommand()
            }
        }


    }

    /**
     * Check if a command name is valid (only alphanumeric+underscore, within char limit) and not a reserved "help" command.
     * @param cmdName 
     * @returns 
     */
    private static isValidCmdName(cmdName: string) {
        const regex = new RegExp("^[a-zA-Z0-9_]{1," + maxCommandLength + "}$", "g")
        return regex.test(cmdName) && !helpCommands.includes(cmdName)
    }


    /**
     * Given a message string (which should start by the COMMAND_PREFIX character)
     * @param msgString 
     */
    private static fetchCmdNameFromMsg(msgString: string) {
        const split = msgString.substring(1).split(" ")
        return split[0]
    }


    /**
     * Get public command list, grouped by channel ids. For outputting to user.
     * @returns 
     */
    private static getPublicCommandList(): string {

        const publicCommands = this.commands.filter(command => command.type == CommandType.PUBLIC)

        const commandsByChannelId: {[id: string]: BotCommand[]} = {}
        
        // Group public commands by channel of restriction (if any)
        for(const command of publicCommands) {
            const channelId = command.restrictedChannelId ? command.restrictedChannelId : "none"
            if(Array.isArray(commandsByChannelId[channelId])) {
                commandsByChannelId[channelId].push(command)
            } else {
                commandsByChannelId[channelId] = [command]
            }
        }

        // Make list of commands grouped by list
        let text = ""
        for(const channelId of Object.keys(commandsByChannelId)) {
            if(channelId == "none") {
                text += "__Comandos generales:__\n"
                for(const command of commandsByChannelId[channelId]) {
                    text += "**/" + command.name + "**" + (command.args ? " "+command.args : "") + ": " + command.description + "\n"
                }
            } else {
                const channel = Discord.getInstance().channels.cache.find(channel => channel.id == channelId)
                if(channel) {
                    text += "\n__Comandos del canal <#"+channel.id+">:__\n"
                    for(const command of commandsByChannelId[channelId]) {
                        text += "**/" + command.name + "**" + (command.args ? " "+command.args : "") + ": " + command.description + "\n"
                    }
                }
            }  
        }
        
        return text
    }


    /**
     * Get admin command list as string, for outputting to user.
     * @returns 
     */
    private static getAdminCommandList(): string {
        const publicCommands = this.commands.filter(command => command.type == CommandType.ADMIN)

        let text = "__Comandos Admin:__\n"
        for(const command of publicCommands) {
            text += "**/" + command.name + "**" + (command.args ? " "+command.args : "") + ": " + command.description + "\n"
        }
        return text
    }


}