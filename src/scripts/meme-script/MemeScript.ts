import Script from "../Script"
import { Message } from "discord.js"
import * as path from 'path'
import BotVoiceActions from "@lib/BotVoiceActions"
import ScoreSaberApi from "@lib/ScoreSaberApi"

const MEME_IMGS = [
    
]


export class MemeScript extends Script {

    protected scriptName = "Meme Script"

    protected onInit() {
        console.log("Script initialized!! Do something.. Lol")
        
    }

    protected onUserMessage: undefined


    protected registerCommands() {

        /*const api = new ScoreSaberApi()
        api.getPlayer("76561198021081220").then(info => {
            console.log(info)
        })

        this.onCommand("hola", "<nombre> [apellido]", (message: Message, params) => {
            console.log("params", params)
            message.channel.send("Hola " + params[0] + "!")
        }, 
        "Comando para saludar")*/

        this.onCommand("audios", null, async (message: Message) => {
            message.channel.send("/c18, /maiamee, /sacalamano, /sparagmos")
            message.channel.send("/subarashi, /vamoajuga, /algunotrochino, /comidasantos")
            message.channel.send("/cruentasserpientes, /earlgray, /entoncesno, /feu")
            message.channel.send("/fuegotiene, /gramofone, /granofino, /jirafanozafa")
            message.channel.send("/meteteelcumpleanios, /muebleslaqueados, /quepasamivida, /sartenpescado")
            message.channel.send("/sonreijavito, /tarjetaoefectivo, /tienecaradeboludo, /tepasominen")
        })


        this.onCommand("c18", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "c18n.mp3", 0.5)
        })

        this.onCommand("maiamee", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "maiamee.mp3", 0.5)
        })

        this.onCommand("sacalamano", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "sacalamano.mp3")
        })

        this.onCommand("sparagmos", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "sparagmos.mp3", 0.8)
        })

        this.onCommand("subarashi", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "subarashi.mp3", 0.8)
        })

        this.onCommand("vamoajuga", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "vamoajuga.mp3")
        })


        this.onCommand("algunotrochino", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "algunotrochino.mp3", 0.7)
        })

        this.onCommand("comidasantos", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "comidasantos.mp3", 0.6)
        })

        this.onCommand("cruentasserpientes", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "cruentasserpientes.mp3", 0.6)
        })

        this.onCommand("earlgray", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "earlgray.mp3", 0.6)
        })

        this.onCommand("entoncesno", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "entoncesno.mp3", 0.6)
        })

        this.onCommand("feu", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "feu.mp3", 0.6)
        })


        this.onCommand("fuegotiene", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "fuegotiene.mp3", 0.6)
        })

        this.onCommand("gramofone", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "gramofone.mp3", 0.6)
        })

        this.onCommand("granofino", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "granofino.mp3", 0.6)
        })

        this.onCommand("jirafanozafa", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "jirafanozafa.mp3", 0.6)
        })

        this.onCommand("meteteelcumpleanios", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "meteteelcumpleanios.mp3", 0.6)
        })

        this.onCommand("muebleslaqueados", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "muebleslaqueados.mp3", 0.6)
        })


        this.onCommand("quepasamivida", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "quepasamivida.mp3", 1)
        })

        this.onCommand("sartenpescado", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "sartenpescado.mp3", 0.6)
        })

        this.onCommand("sonreijavito", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "sonreijavito.mp3", 0.7)
        })

        this.onCommand("tarjetaoefectivo", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "tarjetaoefectivo.mp3", 0.6)
        })

        this.onCommand("tienecaradeboludo", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "tienecaradeboludo.mp3", 0.7)
        })

        this.onCommand("tepasominen", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "tepasominen.mp3", 0.7)
        })

        // register crons


        // register onmessage

        // 
    }
    
}