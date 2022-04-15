
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

const COMMAND_GRAL_GROUP_NAME = "general"


/**
 * Class that handles the registration and submition of all commands in the discord server for this bot.
 * These commands are all "classic" plain text discord message commands.
 */
export class CommandManager {


    /**
     * List of all registered commands. Used mostly for validating against not registering already existing commands, and for listing them to the user.
     * This list is not involved in the handler and execution of commands; handler is registered in bot-commander when registering the command.
     */
    private static commands: BotCommand[] = []


    /**
     * Register a new public command. Commands should be registered on initialization of the bot/Scripts, not after at runtime.
     * @param commandName The command name, without slash. Must be alphanumeric + underscore. Ex: my_cmd_3 (would be called with /my_cmd_3)
     * @param args The arguments, in the syntax of bot-commander library. https://github.com/friscoMad/botCommander#specify-the-argument-syntax
     * @param commandAction 
     * @param description 
     * @param groupName Command group name. Used to group commands when displaying list to the user. Use NULL for general group.
     * @param restrictedChannelId 
     */
    public static newCommand(commandName: string, args: string | null, commandAction: CommandActionFunction, description?: string, groupName?: string, restrictedChannelId?: string) {
        this.registerCommand(CommandType.PUBLIC, commandName, args, commandAction, description, groupName, restrictedChannelId)
    }


    /**
     * Register a new admin command. Commands should be registered on initialization of the bot/Scripts, not after at runtime.
     * @param commandName The command name, without slash. Must be alphanumeric + underscore. Ex: my_cmd_3 (would be called with /my_cmd_3)
     * @param args The arguments, in the syntax of bot-commander library. https://github.com/friscoMad/botCommander#specify-the-argument-syntax
     * @param commandAction 
     * @param description 
     * @param groupName Command group name. Used to group commands when displaying list to the user. Use NULL for general group.
     */
    public static newAdminCommand(commandName: string, args: string | null, commandAction: CommandActionFunction, description?: string, groupName?: string) {
        this.registerCommand(CommandType.ADMIN, commandName, args, commandAction, description, groupName)
    }


    /**
     * Register new command. For internal use of this class.
     */
    private static registerCommand(commandType: CommandType, commandName: string, args: string | null, commandAction: CommandActionFunction, description?: string, groupName?: string, restrictedChannelId?: string) {

        if(!this.isValidCmdName(commandName)) {
            throw new Error("Error registering command. Command name '" + commandName + "' is invalid.")
        }

        if(groupName == COMMAND_GRAL_GROUP_NAME) {
            throw new Error("Command group name '"+COMMAND_GRAL_GROUP_NAME+"' is reserved.")
        }

        if(this.commands.find(command => command.name == commandName)) {
            throw new Error("Command '"+commandName+"' is already registered. It may be a base command or it was already registered by another script.")
        }

        // Push new command to our commands list
        this.commands.push({
            type: commandType,
            groupName: groupName,
            name: commandName,
            args: args,
            description: description,
            //commandAction: commandAction, // to-do: check if necessary
            restrictedChannelId: (commandType == CommandType.PUBLIC && restrictedChannelId) ? restrictedChannelId : null
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
     * This is the handler called when any user submits a command-like text message (starting with slash) in any channel (ex: /hello)
     * Shall not be called from other parts of the app other than on initialization.
     */
    public static onUserSubmitCommand(message: Message) {
        
        const userCommand = this.fetchCmdNameFromMsg(message.content)
        const command = this.commands.find(command => command.name == userCommand)

        // Ignore if command is not registered in command list or in reserved help command list
        if(command == null && !helpCommands.includes(userCommand)) {
            return
        }

        // Check if the user is admin AND is in the admin commands channel id
        const isInAdminChannel = (UserManager.isAdmin(message.author.id) && message.channel.id == process.env.DISCORD_CHANNEL_ID_ADMIN)

        // Override for "help" command
        if(helpCommands.includes(userCommand)) {
            if(isInAdminChannel) {
                message.reply(this.getCommandList(CommandType.ADMIN))
            } else {
                message.reply(this.getCommandList(CommandType.PUBLIC))
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
     * Get command list, grouped by channel ids. For outputting to user.
     * @returns 
     */
    private static getCommandList(commandType: CommandType): string {

        const publicCommands = this.commands.filter(command => command.type == commandType)
        const groupedCommands = this.groupCommandsByGroupName(publicCommands)

        // Make list of commands grouped by command group name
        let text = ""

        if(commandType == CommandType.ADMIN) {
            text += "__**COMANDOS ADMIN**__\n"
        }

        for(const groupName of Object.keys(groupedCommands)) {
            if(groupName == COMMAND_GRAL_GROUP_NAME) {
                text += "__Comandos generales:__\n"
                for(const command of groupedCommands[groupName]) {
                    text += "**/" + command.name + "**" + (command.args ? " "+command.args : "") + (command.description ? ": " + command.description : " (sin descripción)") + "\n"
                }
            } else {
                text += "\n__" + groupName + "__\n"
                for(const command of groupedCommands[groupName]) {
                    text += "**/" + command.name + "**" + (command.args ? " "+command.args : "") + (command.description ? ": " + command.description : " (sin descripción)") + "\n"
                }
            }  
        }
        
        return text
    }


    /**
     * Given an array of commands, group them and return them into an object which keys are the group names, and the values are the command list of said group.
     * @param commands 
     * @returns 
     */
    private static groupCommandsByGroupName(commands: BotCommand[]): {[id: string]: BotCommand[]} {

        const commandsByGroupName: {[id: string]: BotCommand[]} = {}

        for(const command of commands) {
            const groupName = command.groupName ? command.groupName : COMMAND_GRAL_GROUP_NAME
            if(Array.isArray(commandsByGroupName[groupName])) {
                commandsByGroupName[groupName].push(command)
            } else {
                commandsByGroupName[groupName] = [command]
            }
        }

        return commandsByGroupName
    }


}