import fs from "fs"
import moment from "moment"

export default class FileBackupRotator {

    
    /**
     * 
     * @param filePath 
     * @param destinationFolder 
     */
    public static backupFile(filePath: string, destinationFolder: string) {

        const fileName = filePath.replace(/^.*[\\\/]/, '')
        const fileNameOnly = fileName.split(".")[0]
        const fileExtension = fileName.split(".")[1]

        const newFileName = `${fileNameOnly}-${moment().format("Y-MM-D")}.${fileExtension}`

        const destinationPath = `backups/${destinationFolder}/${newFileName}`

        try {
            fs.copyFileSync(filePath, destinationPath)
        } catch(error) {
            console.log("Error copying backup file: ", error)
        }
    

    }

}