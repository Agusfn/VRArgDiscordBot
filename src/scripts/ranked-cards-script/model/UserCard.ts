import { Model } from "sequelize"
import { UserCardI } from "../ts/index"

export class UserCard extends Model {}

export interface UserCard extends UserCardI { }