import { Model } from "sequelize"
import { RankedCardI } from "../ts/index"

export class RankedCard extends Model {}

export interface RankedCard extends RankedCardI { }