import sequelize from "@core/sequelize"
import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize"


/**
 * A specific map on a specific difficulty for a given song. Contains song info, mapper, max score, and other data.
 * Many Leaderboards may exist for a same song if it has multiple difficulties.
 */
export class Leaderboard extends Model<InferAttributes<Leaderboard>, InferCreationAttributes<Leaderboard>> {

    /** ScoreSaber leaderboard id */
    id: number
    /** Another identification for this Leaderboard/map */
    songHash: string
    /** Self explanatory */
    songName: string
    /** Subtitle of song. Empty in most cases apparently. */
    songSubName: string
    /** Artist maker of the song. */
    songAuthorName: string
    /** Mapper */
    levelAuthorName: string
    /** The specific difficulty number of the map of this song. 7 is expert. 9 is expert+ */
    difficultyNumber: number
    /** String that contains the difficulty name and gamemode. For example: "_ExpertPlus_SoloStandard" */
    difficultyName: string
    /** The maximum score that can be achieved with 100% acc */
    maxScore: number
    /** Date in which this map got created in ScoreSaber */
    createdDate: Date
    /** Date in which this map got ranked */
    rankedDate?: Date
    /** Date in which this map got qualified (previous step to ranked) */
    qualifiedDate?: Date
    /** Whether this map is ranked or not */
    ranked: boolean
    /** Whether this map was qualified */
    qualified: boolean
    /** The amount of stars of this map. It's the number that best describes its difficulty. */
    stars: number
    /** Image URL of the cover of the song/map */
    coverImage: string


    /**
     * Get a human readable line with the map info of this Leaderboard.
     */
    public readableMapDesc(): string {

        let text

        if(this.songAuthorName) {
            text = "_" + this.songAuthorName + " - " + this.songName + "_"
        } else {
            text = "_"+this.songName+"_"
        }
        
        if(this.levelAuthorName) {
            text += " ("+this.levelAuthorName+")"
        }

        text += " en " + this.readableDifficulty()

        if(this.ranked && this.stars) {
            text += " (" + this.stars + "★)"
        } else {
            text += " (unranked)"
        }

        return text
    }


    /**
     * Get difficulty name of this map (Leaderboard in a readable format)
     * @returns 
     */
    public readableDifficulty(): string {
        if(this.difficultyName == "_Easy_SoloStandard") {
            return "Easy"
        } else if(this.difficultyName == "_Normal_SoloStandard") {
            return "Normal"
        } else if(this.difficultyName == "_Hard_SoloStandard") {
            return "Hard"
        } else if(this.difficultyName == "_Expert_SoloStandard") {
            return "Expert"
        } else if(this.difficultyName == "_ExpertPlus_SoloStandard") {
            return "Expert+"
        }
        return "difficulty not defined"
    }

}



Leaderboard.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    songHash: DataTypes.STRING,
    songName: DataTypes.STRING,
    songSubName: DataTypes.STRING,
    songAuthorName: DataTypes.STRING,
    levelAuthorName: DataTypes.STRING,
    difficultyNumber: DataTypes.INTEGER,
    difficultyName: DataTypes.STRING,
    maxScore: DataTypes.INTEGER,
    createdDate: DataTypes.DATE,
    rankedDate: DataTypes.DATE,
    qualifiedDate: DataTypes.DATE,
    ranked: DataTypes.BOOLEAN,
    qualified: DataTypes.BOOLEAN,
    stars: DataTypes.DECIMAL(4, 2),
    coverImage: DataTypes.STRING
}, 
{ 
    sequelize: sequelize, 
    modelName: "Leaderboard",
    tableName: "leaderboards",
    timestamps: false
})