import "./fixTsPaths"
import { initializeApp } from "@utils/initializeApp"
import { ScriptLoader, MemeScript } from "@scripts/index"
import discordClient from "@utils/discordClient"

import { User } from "./model/User"
import logger from "@utils/logger"
import * as cron from "node-cron"
import axios from "axios"

(async () => {

    //

    /**
     * Initialize config, database, ORM, etc.
     */
    await initializeApp()

    //console.log("db file: ", process.env.DB_FILE)

    ScriptLoader.registerScript(MemeScript)
    ScriptLoader.initializeScripts()
    
    /*const jane = await User.create({
        username: 'janedoe',
        birthday: new Date(1980, 6, 20)
    });*/

    /*const users = await User.findAll()

    for(const user of users) {
        console.log(user.birthday.getMonth())
    }*/
    //const jane = User.findOne()
    //console.log(jane.toJSON());


    // Emitted when the client becomes ready to start working.
    /*discordClient.on("ready", function(){
        console.log(`the client becomes ready to start`);
        console.log(`I am ready! Logged in as ${discordClient.user.tag}!`);
    });
    
    
    discordClient.on("message", function(message) { 
        console.log(message.content)          
    });                                      
    
    discordClient.on("message", function(message) { 
        console.log("AA"+message.content)          
    });*/


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