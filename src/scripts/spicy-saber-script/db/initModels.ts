import initUsers from "./initUsers"
import initSongs from "./initSongs"
import initUserScores from "./initUserScores"
import setRelationships from "./setRelationships"

/**
 * Entry point for loading sequelize model schemes
 */
export default () => {

    initUsers()
    initSongs()
    initUserScores()

    // Load any relationship after models have been initialized
    setRelationships()

}
