import logger from "./logger"


export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * Custom function to log errors, since different libraries throw different data types for error callbacks.
 * @param error 
 */
export const logException = (error: any) => {

    if(typeof error == "string") { // some libraries, like node cron, throw strings
        logger.error(error)
    } else if(typeof error == "object") { // Exeption, probably

        if(error?.name && (<string>error.name).toLowerCase().includes("sequelize")) { // is a sequelize exception (they are loaded with data)

            if(typeof error.errors == "object") {
                logger.error("Sequelize error: " + error.errors.map((error: any) => error.message).join(", "))
            }

            if(process.env.DEBUG == "true") {
                console.log(error) // show a bunch of data of sequelize error
            }
        } else {
            logger.error(error)

            if(error.stack) {
                logger.error(error?.stack)
            }
        }
    }

}