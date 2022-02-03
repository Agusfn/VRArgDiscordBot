import initLeaderboards from "./initLeaderboards"
import initPlayerScores from "./initPlayerScores"
import initSSPlayers from "./initSSPlayers"
import setRelationships from "./setRelationships"

/**
 * Entry point for loading sequelize model schemes
 */
export default () => {

    initSSPlayers()
    initLeaderboards()
    initPlayerScores()


    // Load any relationship after models have been initialized
    setRelationships()

}

