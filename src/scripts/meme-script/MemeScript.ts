import { Script } from "@lib/index"
import { Message } from "discord.js"
import * as path from 'path'
import BotVoiceActions from "@lib/BotVoiceActions"
import ScoreSaberApi from "@lib/ScoreSaberApi"

const MEME_IMGS = [
    
]


export class MemeScript extends Script {

    protected scriptName = "Meme Script"

    protected onDiscordReady() {
        
    }

    protected onUserMessage: undefined
    protected initDbModels: undefined

    public onInitialized() {

        /*const api = new ScoreSaberApi()
        api.getPlayer("76561198021081220").then(info => {
            console.log(info)
        })

        this.onCommand("hola", "<nombre> [apellido]", (message: Message, params) => {
            console.log("params", params)
            message.channel.send("Hola " + params[0] + "!")
        }, 
        "Comando para saludar")*/

        this.addCommand("audios", null, async (message: Message) => {
            message.channel.send("/c18, /maiamee, /sacalamano, /sparagmos")
            message.channel.send("/subarashi, /vamoajuga, /algunotrochino, /comidasantos")
            message.channel.send("/cruentasserpientes, /earlgray, /entoncesno, /feu")
            message.channel.send("/fuegotiene, /gramofone, /granofino, /jirafanozafa")
            message.channel.send("/meteteelcumpleanios, /muebleslaqueados, /quepasamivida, /sartenpescado")
            message.channel.send("/sonreijavito, /tarjetaoefectivo, /tienecaradeboludo, /tepasominen")
        })


        this.addCommand("c18", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "c18n.mp3", 0.5)
        })

        this.addCommand("maiamee", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "maiamee.mp3", 0.5)
        })

        this.addCommand("sacalamano", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "sacalamano.mp3")
        })

        this.addCommand("sparagmos", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "sparagmos.mp3", 0.8)
        })

        this.addCommand("subarashi", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "subarashi.mp3", 0.8)
        })

        this.addCommand("vamoajuga", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "vamoajuga.mp3")
        })


        this.addCommand("algunotrochino", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "algunotrochino.mp3", 0.7)
        })

        this.addCommand("comidasantos", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "comidasantos.mp3", 0.6)
        })

        this.addCommand("cruentasserpientes", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "cruentasserpientes.mp3", 0.6)
        })

        this.addCommand("earlgray", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "earlgray.mp3", 0.6)
        })

        this.addCommand("entoncesno", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "entoncesno.mp3", 0.6)
        })

        this.addCommand("feu", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "feu.mp3", 0.6)
        })


        this.addCommand("fuegotiene", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "fuegotiene.mp3", 0.6)
        })

        this.addCommand("gramofone", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "gramofone.mp3", 0.6)
        })

        this.addCommand("granofino", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "granofino.mp3", 0.6)
        })

        this.addCommand("jirafanozafa", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "jirafanozafa.mp3", 0.6)
        })

        this.addCommand("meteteelcumpleanios", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "meteteelcumpleanios.mp3", 0.6)
        })

        this.addCommand("muebleslaqueados", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "muebleslaqueados.mp3", 0.6)
        })


        this.addCommand("quepasamivida", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "quepasamivida.mp3", 1)
        })

        this.addCommand("sartenpescado", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "sartenpescado.mp3", 0.6)
        })

        this.addCommand("sonreijavito", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "sonreijavito.mp3", 0.7)
        })

        this.addCommand("tarjetaoefectivo", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "tarjetaoefectivo.mp3", 0.6)
        })

        this.addCommand("tienecaradeboludo", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "tienecaradeboludo.mp3", 0.7)
        })

        this.addCommand("tepasominen", null, async (message: Message) => {
            BotVoiceActions.playSoundInChannel(message.member.voice.channel, "tepasominen.mp3", 0.7)
        })

        // register crons


        // register onmessage

        // 
    }
    
}