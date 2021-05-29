import "./fixTsPaths"
import { initializeApp } from "@utils/initializeApp"
import Sequelize from "@utils/Sequelize"
import { ScriptLoader, MemeScript, SpicySaberScript } from "@scripts/index"
import discordClient from "@utils/discordClient"

import { User } from "./model/User"
import logger from "@utils/logger"
import * as cron from "node-cron"
import axios from "axios"


(async () => {

    // Initialize config, database, ORM, etc.
    await initializeApp()

    // Register and initialize scripts
    ScriptLoader.registerScript(MemeScript)
    ScriptLoader.registerScript(SpicySaberScript)
    ScriptLoader.initializeScripts()

    // Sync the defined models on the scripts (if any) on the database
    await Sequelize.syncModels()

})();



/*
const client = new Discord.Client()


// Emitted when the client becomes ready to start working.
client.on("ready", function(){
    console.log(`the client becomes ready to start`);
	console.log(`I am ready! Logged in as ${client.user.tag}!`);
});


client.on("message", function(message) { 
    console.log(message.content)          
});                                      


logger.info("Init!")

cron.schedule('* * * * *', function() {
    logger.info("Info log!")
});
*/