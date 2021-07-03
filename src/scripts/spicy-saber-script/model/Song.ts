import { Model } from "sequelize"


export class Song extends Model {

    public songHash: string
    public songName: string
    public songSubName: string
    public songAuthorName: string
    public levelAuthorName: string

}


