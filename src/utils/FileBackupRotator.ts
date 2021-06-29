import fs from "fs"
import moment from "moment"
import { DATABASE_BACKUP_MAX_FILES } from "@utils/configuration"

export default class FileBackupRotator {


    /**
     * 
     * @param filePath 
     * @param destinationFolder 
     */
    public static backupFile(filePath: string, destinationFolder: string, rotationFreqDays?: number) {

        const fileName = filePath.replace(/^.*[\\\/]/, '')
        const fileNameOnly = fileName.split(".")[0]
        const fileExtension = fileName.split(".")[1]

        const newFileName = `${fileNameOnly}-${moment().format("Y-MM-D")}.${fileExtension}`

        const destinationPath = `backups/${destinationFolder}/${newFileName}`

        try {
            fs.copyFileSync(filePath, destinationPath)

            if(rotationFreqDays) {
                // to-do: delete old backup file
            }

        } catch(error) {
            console.log("Error copying backup file: ", error)
        }
    

    }

}