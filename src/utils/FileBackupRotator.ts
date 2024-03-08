import { DATABASE_BACKUP_MAX_FILES } from "@utils/configuration"
import logger from "@utils/logger"
import moment from "moment"
import fs from "fs"


const BACKUP_DATE_FORMAT = "Y-MM-DD"


export default class FileBackupRotator {


    /**
     * Make a backup copy of a file with timestamp to the backup directory <proyect_dir>/backups/ with optional rotation.
     * @param filePath 
     * @param destinationFolder 
     */
    public static backupFile(filePath: string, destinationFolder: string, rotationFreqDays?: number) {

        if(rotationFreqDays && (typeof rotationFreqDays != "number" || !Number.isInteger(rotationFreqDays)) ) {
            throw new Error("rotationFreqDays must be an integer number.")
        }

        const fileNameFull = filePath.replace(/^.*[\\\/]/, '')
        const fileName = fileNameFull.split(".")[0]
        const fileExtension = fileNameFull.split(".")[1]

        // Make new file name with current date
        const newFileName = `${fileName}-${moment().format(BACKUP_DATE_FORMAT)}`

        const destinationPath = `backups/${destinationFolder}/${newFileName}.${fileExtension}`

        try {
            if(fs.existsSync(filePath)) {
                if(!fs.existsSync(destinationPath)) {
                    fs.copyFileSync(filePath, destinationPath)
                    logger.info("Made backup file " + destinationPath)
                } else {
                    logger.info("Backup file already exists: " + destinationPath + ". Ignoring copy.")
                }
            } else {
                logger.info("File to backup doesn't exist: " + filePath)
            }
        } catch(error) {
            logger.info("Error copying backup file: ", error)
        }

        if(rotationFreqDays) {
            this.removeOldRotationBackup(fileName, fileExtension, destinationFolder, rotationFreqDays)
        }
    }


    /**
     * Remove old backup rotation file.
     * @param fileName 
     * @param fileExtension 
     * @param destinationFolder 
     * @param rotationFreqDays 
     */
    private static removeOldRotationBackup(fileName: string, fileExtension: string, destinationFolder: string, rotationFreqDays: number) {
        try {
            const oldestBackupDate = moment().subtract(rotationFreqDays * (DATABASE_BACKUP_MAX_FILES-1), "days")
            const oldFileName = `${fileName}-${oldestBackupDate.format(BACKUP_DATE_FORMAT)}`
            const oldFilePath = `backups/${destinationFolder}/${oldFileName}.${fileExtension}`

            if(fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath)
                logger.info("Deleted old rotation file " + oldFilePath)
            }
        } catch(error) {
            logger.info("Error removing old rotation backup file: ", error)
        }
    }


}