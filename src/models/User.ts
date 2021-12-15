import { Model } from "sequelize"

export class User extends Model {

    public discordUserId: string
    public username: string
    public joinDate: Date
    public isPresent: boolean
    public leaveDate: Date
    public isAdmin: boolean
    

    public isMasterAdmin() {
        return this.discordUserId == process.env.MASTER_ADMIN_DISCORD_USER_ID
    }

}


