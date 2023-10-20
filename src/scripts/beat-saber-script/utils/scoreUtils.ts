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


/**
 * Bootleg function to calculate an approximate raw pp.
 * @param totalPp 
 */
export const getApproximateRawPp = (totalPp: number): number => {

    // Factor obtained with polynomic regression of degree 2 with values:
    // player	pp tot	raw pp	factor
    // Derek	13297	456	    29.16008772
    // Elecast	11350	383.64	29.58502763
    // Agusfn	10788	363	    29.71900826
    // Darturr	10736	359.58	29.85705545
    // Andres	9470	315.84	29.98353597
    // Salva	9257.37	283.3	32.67691493
    // Morcil	7333.32	227.27	32.2669952
    // Kilthral	7178	216.42	33.16699011
    // Doger	6863	202.15	33.9500371

    const factor = (8.53e-8 * (totalPp ** 2)) - (0.0024212661 * totalPp) + 46.165368855;

    return roundNumber(totalPp / factor, 2);
}