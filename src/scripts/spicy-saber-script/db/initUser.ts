import { DataTypes } from "sequelize"
import { User } from "../model/"
import Sequelize from "@utils/Sequelize"

export default () => {

    User.init({
        username: DataTypes.STRING,
        birthday: DataTypes.DATE
    }, { sequelize: Sequelize.getInstance(), modelName: 'user' });

}