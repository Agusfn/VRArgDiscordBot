require('dotenv').config()
import "./fixTsPaths"
import { TestScript } from "@scripts/test-script/TestScript";
import { ScriptLoader } from "@core/ScriptLoader";
import { DiscordManager } from "@core/DiscordManager";


(async() => {

    const discordManager = new DiscordManager(process.env.DISCORD_BOT_TOKEN, process.env.DISCORD_GUILD_ID);
    await discordManager.initialize();

    const scriptLoader = new ScriptLoader(discordManager, [
        TestScript
    ]);
    
    await scriptLoader.initializeScripts();


})()


