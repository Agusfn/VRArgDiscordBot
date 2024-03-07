import { roundNumber } from "@utils/index"

const linear = require('everpolate').linear

// x = new score percentage obtained. y = necessary percentual improvement for said score
const X_AccObtained = [60, 70, 80, 90, 91, 92, 93, 94, 95, 96, 100]
const Y_NeededImprovement = [64, 32, 16, 4, 2.5, 1.35, 0.95, 0.6, 0.5, 0.4, 0.3]


/**
 * Check whether a player has "significantly improved" a score of a map given the old and new accuracy.
 * @param previousAccuracy 
 * @param newAccuracy 
 * @returns 
 */
export const isScoreSignificantlyImproved = (previousAccuracy: number, newAccuracy: number): boolean => {

    const improvement = newAccuracy - previousAccuracy
    const necessaryImprovement = linear(newAccuracy, X_AccObtained, Y_NeededImprovement) // linear interpolation

    return improvement >= necessaryImprovement
}


export const formatAcc = (acc: number) => {
    return roundNumber(acc, 2) + "%"
}


export const getScoreSaberIdFromIdOrURL = (str: string) => {

    if(/^[0-9]{14,19}$/gm.test(str)) {
        return str // scoresaber id
    } else {
        var regex = /^https:\/\/scoresaber\.com\/u\/([0-9]{14,19}).*$/gm
        const matches = regex.exec(str)
        
        if(matches && matches.length >= 2) { 
            return matches[1]
        }
    }

    return null

}