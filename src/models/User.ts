import { UserI } from "@ts/interfaces"
import { Model } from "sequelize"

export class User extends Model {

    public isMasterAdmin() {
        return this.discordUserId == process.env.MASTER_ADMIN_DISCORD_USER_ID
    }

}


export interface User extends UserI { }


