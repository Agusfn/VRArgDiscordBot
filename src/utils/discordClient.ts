import Discord from "discord.js"

export default new Discord.Client({ ws: {
    intents: ["GUILD_MEMBERS"]
}})