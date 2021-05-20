import "./fixTsPaths"
import * as dotenv from "dotenv"
import logger from "@utils/logger"
import Discord from "discord.js"
import * as cron from "node-cron"
import axios from "axios"

dotenv.config()
console.log(process.env.BOT_TOKEN)



const client = new Discord.Client()

client.login(process.env.BOT_TOKEN)

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
