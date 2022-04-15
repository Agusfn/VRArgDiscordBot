import { CommandManager, Discord, UserManager } from "@lib/index"
import { Message } from "discord.js"
import { User } from "@models/index"


export const registerAdminCommands = () => {


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