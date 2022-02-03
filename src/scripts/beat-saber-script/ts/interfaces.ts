
export interface PlayerScoreI {
    id: number
    playerId: number
    leaderboardId: number
    rank: number
    baseScore: number
    modifiedScore: number
    pp: number
    weight: number
    modifiers: string
    multiplier: number
    badCuts: number
    missedNotes: number
    maxCombo: number
    fullCombo: boolean
    timeSet: Date
}


export interface SSPlayerI {
    /** ScoreSaber player id (may be Steam id) */
    id: string
    /** Foreign key to identify the bot/Discord User */
    discordUserId: string
    linkedDate: Date
    /** ScoreSaber nickname */
    name: string
    /** Full URL from scoresaber cdn */
    profilePicture: string
    country: string
    pp: number
    /** Global rank */
    rank: number
    countryRank: number
    banned: boolean
    inactive: boolean
    totalScore: number
    totalRankedScore: number
    avgRankedAccuracy: number
    totalPlayCount: number
    rankedPlayCount: number
    // Score:
    fetchedAllScoreHistory: boolean
    lastHistoryFetchPage: number
    lastPeriodicStatusCheck: Date
    milestoneAnnouncements: boolean

    createdAt: Date
    updatedAt: Date
}


export interface LeaderboardI {
    /** ScoreSaber leaderboard id */
    id: number
    songHash: string
    songName: string
    songSubName: string
    songAuthorName: string
    levelAuthorName: string
    difficultyNumber: number
    difficultyName: string
    /** The maximum score that can be achieved with 100% acc */
    maxScore: number
    createdDate: Date
    rankedDate?: Date
    qualifiedDate?: Date
    ranked: boolean
    stars: number
    coverImage: string
}




export interface UserRankInfo {
    discordUserId: string,
    globalRank: number
}