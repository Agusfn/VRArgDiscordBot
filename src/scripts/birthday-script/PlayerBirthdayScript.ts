import { Script } from "@lib/index"
import { Message } from "discord.js"
import { CommandManager } from "@lib/CommandManager"
import { User } from "@models/index"
import { BirthdayManager } from "./lib/BirthdayManager"
import initModels from "./db/initModels"


export class PlayerBirthdayScript extends Script {

    protected scriptName = "Player Birthday Script"

    protected onUserMessage: undefined
    public initDbModels = initModels

    public async onInitialized() {

        CommandManager.newCommand("registrar_cum", "<fecha cumpleaños>", async (message: Message, args) => {

            let birthday = args[0]
            
            // convert birthday to date with format dd/mm/yyyy

            if (birthday[2] !== "/" || birthday[5] !== "/") {
                message.channel.send("Formato de fecha incorrecto, debe ser dd/mm/yyyy")
                return
            }

            birthday = birthday.split("/")

            if(birthday.length !== 3) {
                message.channel.send("Formato de fecha incorrecto, debe ser dd/mm/yyyy")
                return
            }

            const day = parseInt(birthday[0])

            if(day < 1 || day > 31) {
                message.channel.send("Día incorrecto")
                return
            }

            const month = parseInt(birthday[1])

            if(month < 1 || month > 12) {
                message.channel.send("Mes incorrecto")
                return
            }

            const year = parseInt(birthday[2])

            if(year < 1900 || year > 2022) {
                message.channel.send("Año incorrecto")
                return
            }

            birthday = new Date(year, month - 1, day)

            const birthdayManager = new BirthdayManager()

            const birthdayUser = await birthdayManager.addBirthDayToUser(message.author.id, birthday)

            if (!birthdayUser) {
                message.channel.send(birthdayManager.getErrorMsg())
                return
            } else {
                message.channel.send("Cumpleaños registrado!")
            }

        }, "Registra tu fecha de cumpleaños", "Cumpleaños")

        CommandManager.newCommand("borrar_cum", "", async (message: Message, args) => {

            const birthdayManager = new BirthdayManager()

            const birthdayUser = await birthdayManager.removeBirthDayToUser(message.author.id)

            if (!birthdayUser) {
                message.channel.send(birthdayManager.getErrorMsg())
                return
            } else {
                message.channel.send("Cumpleaños eliminado!")
            }

        }, "Elimina tu fecha de cumpleaños", "Cumpleaños")

        CommandManager.newCommand("ver_cum", "", async (message: Message, args) => {

            const birthdayManager = new BirthdayManager()

            const birthdayUser = await birthdayManager.getBirthDayFromUser(message.author.id)

            if (!birthdayUser) {
                message.channel.send(birthdayManager.getErrorMsg())
                return
            } else {
                // return birthdayUser.birthday in format dd/mm/yyyy

                message.channel.send("Tu cumpleaños es el " + birthdayUser.birthday.getDate() + "/" + (birthdayUser.birthday.getMonth() + 1) + "/" + birthdayUser.birthday.getFullYear())
            }

        }, "Devuelve la fecha de cumpleaños del usuario", "Cumpleaños")


    }
    
}

// Create a buffer with custom content
// const fileContent = 'This is custom text content.';
// const buffer = Buffer.from(fileContent, 'utf-8');

// // Send the buffer as an attachment
// await message.channel.send({
//     files: [
//         {
//             attachment: buffer,
//             name: 'customfile.txt'
//         }
//     ]
// });