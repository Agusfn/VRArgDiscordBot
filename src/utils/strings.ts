

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
