require('dotenv').config()
import "./fixTsPaths"
import { TestScript } from "@scripts/test-script/TestScript";
import { ScriptLoader } from "@core/ScriptLoader";
import { DiscordClient } from "@core/DiscordClient";
import sequelize from "@core/sequelize";
import logger from "@utils/logger";
import { CoreScript } from "@scripts/core-script/CoreScript";


(async() => {

    const discordClient = new DiscordClient(process.env.DISCORD_BOT_TOKEN, process.env.DISCORD_GUILD_ID);

    // Make sure DB connection works
    await sequelize.authenticate();
    logger.info("Sequelize DB authenticated");

    const scriptLoader = new ScriptLoader(discordClient, [
        CoreScript,
        TestScript
    ]);
    
    // Register Discord universal event listener for slash commands
    discordClient.setCommandListener();

    // Register all other Discord events and read slash commands from all scripts
    await scriptLoader.initializeScripts();

    // Log into discord after all events and commands have been registered
    await discordClient.login();


})()


process.on('SIGINT', function() {
    logger.info("Closing gracefully...");
    logger.end();
    sequelize.close();
    DiscordClient.getInstance().destroy();
    process.exit();
});

process.on('uncaughtException', error => {
    logger.error("Uncaught Exception: " + (error.stack ? error.stack : error));
});
process.on('unhandledRejection', (error: any, promise) => {
    logger.error("Unhandled Rejection: " + (error.stack ? error.stack : error));
});