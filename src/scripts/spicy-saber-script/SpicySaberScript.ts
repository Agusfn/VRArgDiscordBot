import Script from "../Script"
import { Message } from "discord.js"
import ScoreSaberApi from "@lib/ScoreSaberApi"


export class SpicySaberScript extends Script {

    protected scriptName = "SpicySaber Script"

    protected onInit() {        
    }

    protected onUserMessage: undefined

    protected useDbModels = true

    protected registerCommands() {

        const api = new ScoreSaberApi()
        api.getPlayer("76561198021081220").then(info => {
            console.log(info)
        })

        /**
         * Comando para linkear el usuario de Discord al perfil de ScoreSaber
         */
        this.onCommand("linkear", "<id scoresaber>", (message: Message, params) => {
            console.log("params", params)
            message.author.avatar

        })

        



    }
    
}