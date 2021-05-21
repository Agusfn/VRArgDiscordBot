import Script from "../Script"


export class MemeScript extends Script {

    protected scriptName = "Meme Script"

    protected onInit() {
        console.log("Script initialized!! Do something.. Lol")    
    }

    protected onUserMessage: undefined

    
    protected registerEvents() {

        // register commands
        this.onCommand("help", () => {

        })

        // register crons


        // register onmessage

        // 


    }

    

}