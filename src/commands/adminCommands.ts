import { CommandManager, Discord, UserManager } from "@lib/index"
import { Message } from "discord.js"
import { User } from "@models/index"


export const registerAdminCommands = () => {


    /**
     * List channel id given a piece of the name of the channel
     */
    CommandManager.newAdminCommand("idcanal", "<nombre del canal>", async (message: Message, args) => {

        const channelsFound = Discord.getGuild().channels.cache.filter(channel => channel.name.includes(args[0]))

        let text = ""
        if(channelsFound.size > 0) {
            text += "__Canales encontrados:__\n"
            for(const [channelId, channel] of channelsFound) {
                text += `**${channel.name}:** ${channelId}\n`
            }
        } else {
            text += "No se encontraron canales con ese nombre."
        }
        message.reply(text)

    }, "Obtener el id de un canal del servidor buscando por el nombre.")



    /**
     * List user ids given a piece of the name of the user
     */
     CommandManager.newAdminCommand("idusuario", "<nombre del usuario>", async (message: Message, args) => {

        const query = (<string>args[0]).toLowerCase()

        const membersFound = Discord.getGuild().members.cache.filter(member => {
            return member.user.username.toLowerCase().includes(query) || // username is the account username (always present)
                (member.nickname != null && member.nickname.toLowerCase().includes(query)) // nickname is an optional pseudonim of this user in the server
        })

        let text = ""
        if(membersFound.size > 0) {
            text += "__Usuarios encontrados:__\n"
            for(const [memberId, member] of membersFound) {
                if(member.nickname) {
                    text += `**${member.user.username} (${member.nickname}):** ${memberId}\n`
                } else {
                    text += `**${member.user.username}:** ${memberId}\n`
                }
            }
        } else {
            text += "No se encontraron usuarios con ese nombre."
        }
        message.reply(text)

    }, "Obtener el id de un usuario del servidor buscando por el nombre.")



    /**
     * View all current admins
     */
    CommandManager.newAdminCommand("admins", null, async (message: Message, args) => {

        const admins = await User.findAll({where: { isAdmin: true }})

        let text = "__Admins:__\n"
        for(const adminUser of admins) {
            text += adminUser.username + (adminUser.isMasterAdmin() ? " *(Master)*" : "") + "\n"
        }
        if(!UserManager.checkAdminIdList(admins)) { // consistency check
            text += "\nSe encontraron inconsistencias en el caché de admin (ver log)."
        }

        message.reply(text)

    }, "Listar los administradores del bot (ChePibe) actuales.")



    /**
     * Make a user admin.
     */
    CommandManager.newAdminCommand("haceradmin", "<id usuario>", async (message: Message, args) => {
        if(message.author.id == args[0]) {
            message.reply("No podés usar este comando con tu propio usuario."); return
        }

        const member = Discord.getGuild().members.cache.find(member => member.user.id == args[0])
        if(!member) {
            message.reply("No se encontró el usuario en el server con el id ingresado. El id de discord es numérico y se puede buscar con /idusuario."); return
        }
        const user = await User.findByPk(member.user.id)
        if(!user) {
            message.reply("No se pudo encontrar al usuario en la DB del bot."); return
        }
        if(user.isAdmin) {
            message.reply("El usuario "+member.user.username+" ya es admin!"); return
        }

        await UserManager.makeUserAdmin(user)
        message.reply("Hecho admin a " + member.user.username + "!")

    }, "Hacer admin del bot a un usuario del server.")



    /**
     * Remove admin from a user
     */
     CommandManager.newAdminCommand("quitaradmin", "<id usuario>", async (message: Message, args) => {
        if(message.author.id == args[0]) {
            message.reply("No podés usar este comando con tu propio usuario."); return
        }
        
        const member = Discord.getGuild().members.cache.find(member => member.user.id == args[0])
        if(!member) {
            message.reply("No se encontró el usuario en el server con el id ingresado. El id de discord es numérico y se puede buscar con /idusuario."); return
        }
        const user = await User.findByPk(member.user.id)
        if(!user) {
            message.reply("No se pudo encontrar al usuario en la DB del bot."); return
        }
        if(!user.isAdmin) {
            message.reply("Al usuario "+member.user.username+" no se le puede quitar admin porque no es admin!"); return
        }

        await UserManager.removeUserAdmin(user)
        message.reply("Quitado el admin a " + member.user.username + "!")

    }, "Quitar admin admin del bot a un usuario del server.")





}