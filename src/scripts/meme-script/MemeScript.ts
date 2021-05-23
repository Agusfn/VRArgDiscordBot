import Script from "../Script"
import { Message } from "discord.js"
import * as path from 'path'
import BotVoiceActions from "@lib/BotVoiceActions"

const MEME_IMGS = [
    
]


export class MemeScript extends Script {

    protected scriptName = "Meme Script"

    protected onInit() {
        console.log("Script initialized!! Do something.. Lol")    
    }

    protected onUserMessage: undefined


    protected registerCommands() {


        this.onCommand("hola", "<nombre> [apellido]", (message: Message, params) => {
            console.log("params", params)
            message.channel.send("Hola " + params[0] + "!")
        }, 
        "Comando para saludar")


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

        // register crons


        // register onmessage

        // 
    }
    
}