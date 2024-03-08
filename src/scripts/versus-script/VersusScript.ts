import { Script } from "@core/Script";
import { DiscordClientWrapper } from "@core/DiscordClient";

export class VersusScript extends Script {

    protected scriptName = "Versus Script";
    
    constructor(public client: DiscordClientWrapper) {
        super(client);
    }

    // public async convertToImage(html: string) {
    //     const nodeHtmlToImage = require('node-html-to-image')
    //     const image = await nodeHtmlToImage({
    //             html: html,
    //             puppeteerArgs: {
    //                     args: ['--no-sandbox']
    //             }
    //     })
    //     return image
    // }

}