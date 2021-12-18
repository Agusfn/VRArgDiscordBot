import { Model } from "sequelize"

export class User extends Model {

    public discordUserId: string
    /** This is the discord username (which cannot be changed) */
    public username: string
    public joinDate: Date
    public isPresent: boolean
    public leaveDate: Date
    public isAdmin: boolean
    

    public isMasterAdmin() {
        return this.discordUserId == process.env.MASTER_ADMIN_DISCORD_USER_ID
    }

}


