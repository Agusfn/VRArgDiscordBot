import { User } from "../../model/index"
import { Sequelize, DataTypes } from "sequelize"

export class UserScheme {

    public static async init(seqInstance: Sequelize) {
        User.init({
            username: DataTypes.STRING,
            birthday: DataTypes.DATE
          }, { sequelize: seqInstance, modelName: 'user' });
    }

}