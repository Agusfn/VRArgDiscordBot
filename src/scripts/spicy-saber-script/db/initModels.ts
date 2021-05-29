//import { DataTypes } from "sequelize"
//import { Song, User, UserScore } from "../model/"
import initUser from "./initUser"

/**
 * Entry point for loading sequelize model schemes
 */
export default () => {

    // We can manually initialize models:

    /*User.init({
        username: DataTypes.STRING,
        birthday: DataTypes.DATE
    }, { sequelize: seqInstance, modelName: 'user' });*/


    // Or segment it in files:
    initUser()

}

