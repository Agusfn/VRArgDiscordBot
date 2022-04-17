


export const getScoreSaberIdFromIdOrURL = (str: string) => {

    if(/^[0-9]{14,19}$/gm.test(str)) {
        return str // scoresaber id
    } else {
        var regex = /^https:\/\/scoresaber\.com\/u\/([0-9]{14,19})$/gm
        const matches = regex.exec(str)
        console.log("matches", matches)
        
        if(matches && matches.length >= 2) { 
            return matches[1]
        }
    }

    return null

}
