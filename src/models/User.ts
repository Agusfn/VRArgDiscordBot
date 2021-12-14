import { Model } from "sequelize"

export class User extends Model {

    public discordUserId: string
    public joinDate: Date
    public isPresent: boolean
    public leaveDate: Date
    public isAdmin: boolean
    
}


