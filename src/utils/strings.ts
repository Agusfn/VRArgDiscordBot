

export const separateMultiLineString = (str: string, maxStringLength: number): string[] => {

    const strings: string[] = [""]
    let currentStringIndex = 0

    const lines = str.split("\n")

    for(const line of lines) {

        if((strings[currentStringIndex].length + line.length) < maxStringLength) {
            strings[currentStringIndex] += "\n" + line
        } else {
            // create a new string with this line
            strings.push(line)
            currentStringIndex++
        }

    }

    return strings
}



export const camelToHyphen = (camelCase: string): string => {
    return camelCase.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export const errorToString = (error: any) => {
    return (error.stack ? error.stack : error) + (error.message ? "\n Message: " + error.message : "")
}