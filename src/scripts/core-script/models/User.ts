import sequelize from "@core/sequelize"
import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize"


export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {

    discordUserId: string
    /** This is the discord username (which cannot be changed) */
    username: string
    joinDate: Date
    isPresent: boolean
    leaveDate: Date

    /**
     * @deprecated Since version 2
     */
    isAdmin: boolean

    public isMasterAdmin() {
        return this.discordUserId == process.env.MASTER_ADMIN_DISCORD_USER_ID
    }

}


User.init({
    discordUserId: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    username: DataTypes.STRING,
    joinDate: DataTypes.DATE,
    isPresent: DataTypes.BOOLEAN,
    leaveDate: DataTypes.DATE,
    isAdmin: DataTypes.BOOLEAN,
}, 
{ 
    sequelize: sequelize, 
    modelName: "User",
    tableName: "users",
    timestamps: false
});