import { DataTypes as Types } from "sequelize"
import SequelizeDBManager from "@lib/SequelizeDBManager"
import { User } from "../"


export default () => {

    User.init({
        discordUserId: {
            type: Types.STRING,
            primaryKey: true
        },
        username: Types.STRING,
        joinDate: Types.DATE,
        isPresent: Types.BOOLEAN,
        leaveDate: Types.DATE,
        isAdmin: Types.BOOLEAN,
    }, 
    { 
        sequelize: SequelizeDBManager.getInstance(), 
        modelName: "User",
        tableName: "users",
        timestamps: false
    })

}