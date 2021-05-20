import "./fixTsPaths"
import * as dotenv from "dotenv"
import logger from "@utils/logger"
import Discord from "discord.js"
import * as cron from "node-cron"
import axios from "axios"
import sqlite3 from "sqlite3"
import { Sequelize, Model, DataTypes } from "sequelize"



const sequelize = new Sequelize('sqlite:./databases/data.db', {
    logging: true
});



class User extends Model {
    public id: number
    public username: string
    public birthday: Date
}


User.init({
    username: DataTypes.STRING,
    birthday: DataTypes.DATE
  }, { sequelize, modelName: 'user' });
  
(async () => {

    await sequelize.authenticate()
    console.log('DB Connection has been established successfully.');

    await sequelize.sync();


    /*const jane = await User.create({
        username: 'janedoe',
        birthday: new Date(1980, 6, 20)
    });*/

    const users = await User.findAll()

    for(const user of users) {
        console.log(user.birthday.getMonth())
    }

    

    //const jane = User.findOne()

    //console.log(jane.toJSON());

    sequelize.close()

})();


/*
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
*/