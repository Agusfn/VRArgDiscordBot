import "./fixTsPaths"
import { TestScript } from "@scripts/test-script/TestScript";
import { ScriptLoader } from "@core/ScriptLoader";
import { DiscordManager } from "@core/DiscordManager";




(async() => {

    const discordManager = new DiscordManager();
    await discordManager.login();

    const scriptLoader = new ScriptLoader(discordManager, [
        TestScript
    ]);
    
    await scriptLoader.initializeScripts();


})()


