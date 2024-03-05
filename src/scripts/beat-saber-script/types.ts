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