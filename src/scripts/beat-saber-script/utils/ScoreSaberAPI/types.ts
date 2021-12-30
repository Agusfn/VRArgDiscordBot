

export interface MetaData {
    total: number,
    page: number,
    itemsPerPage: number
}

export interface Badge {
    image: string,
    description: string,
}

export interface ScoreStats {
    totalScore: number,
    totalRankedScore: number,
    averageRankedAccuracy: number,
    totalPlayCount: number,
    rankedPlayCount: number,
    replaysWatched: number
}

export interface Player {
    id: string,
    name: string,
    profilePicture: string,
    country: string,
    pp: number,
    rank: number,
    countryRank: number
    role: string,
    badges: Badge[],
    histories: string,
    scoreStats: ScoreStats,
    permissions: number,
    banned: boolean,
    inactive: boolean
}

export interface LeaderboardPlayer {
    id: string
    name: string
    profilePicture: string
    country: string
    permissions: number
    role: string
}

export interface Score {
    id: number
    leaderboardPlayerInfo?: LeaderboardPlayer
    rank: number,
    baseScore: number,
    modifiedScore: number,
    pp: number,
    weight: number,
    modifiers: string,
    multiplier: number,
    badCuts: number,
    missedNotes: number,
    maxCombo: number,
    fullCombo: boolean,
    hmd: number,
    hasReplay: boolean,
    timeSet: string
}


export interface Difficulty {
    leaderboardId: number,
    difficulty: number,
    gameMode: string,
    difficultyRaw: string
}


/** A map on a given difficulty */
export interface LeaderboardInfo {
    id: number
    songHash: string,
    songName: string,
    songSubName: string,
    songAuthorName: string,
    levelAuthorName: string,
    difficulty: Difficulty,
    maxScore: number,
    createdDate: string,
    rankedDate?: string,
    qualifiedDate?: string,
    lovedDate?: string,
    ranked: boolean,
    qualified: boolean,
    loved: boolean,
    maxPP: number,
    stars: number,
    positiveModifiers: boolean,
    plays: number,
    dailyPlays: number,
    coverImage: string,
    playerScore?: Score // not used?
    difficulties?: Difficulty[] // not used?
}


export interface PlayerScore {
    score: Score,
    leaderboard: LeaderboardInfo
}

/** This is the response from a player scores request */
export interface PlayerScoreCollection {
    playerScores: PlayerScore[],
    metadata: MetaData
}


export interface ScoreCollection {
    scores: Score[],
    metadata: MetaData
}
