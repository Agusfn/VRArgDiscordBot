export interface PlayerPerformanceInfo {
    playerId: string,
    playerName: string,
    discordUserId: string,
    /** Global rank */
    rank: number,
    countryRank: number,
    avgAccuracy: number,
    milestoneAnnouncements: boolean
}

export const countryNames: { [countryCode: string]: string } = {
    "AR": "Argentina",
    "BE": "Bélgica",
    "BR": "Brasil",
    "CL": "Chile",
    "CO": "Colombia",
    "ES": "España",
    "MX": "México",
    "UY": "Uruguay",
    "IL": "Israel",
    "FR": "Francia",
    "IT": "Italia"
}