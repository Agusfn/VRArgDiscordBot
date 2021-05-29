import { Message } from "discord.js"

export type CommandActionFunction = (...args: any) => any

export interface RegisteredCommand {
    name: string, // name of command. ex: "help"
    action: CommandActionFunction // function to be excecuted when command is triggered
}

/**
 * The metadata containing Discord Message included in every bot-commander command parse, so we can access said Message in the final onCommand handlers.
 */
 export interface CommandMetadata {
    message: Message
}


export interface Badge {
    image: string,
    description: string,
}

export interface PlayerInfo {
    playerId: string,
    pp: number,
    banned: boolean,
    inactive: boolean,
    playerName: string,
    country: string,
    role: string,
    badges: Badge[],
    history: string,
    avatar: string,
    rank: number,
    countryRank: number
}

export interface ScoreStats {
    totalScore: number,
    totalRankedScore: number,
    averageRankedAccuracy: number,
    totalPlayCount: number,
    rankedPlayCount: number
}

export interface Player {
    playerInfo: PlayerInfo,
    scoreStats: ScoreStats
}


export interface PagifiedPlayer {
    playerid: number,
    pp: number,
    banned: number,
    inactive: number,
    name: string,
    country: string,
    role: string,
    history: string,
    rank: number,
    difference: number,
    avatar: string
}

export interface Score {
    scoreId: number,
    leaderboardId: number,
    score: number,
    uScore: number,
    mods: string,
    playerId: string,
    timeset: string,
    pp: number,
    weight: number,
    id: string,
    name: string,
    songSubName: string,
    songAuthorName: string,
    levelAuthorName: string,
    diff: string,
    maxScoreEx: number,
    rank: number
}

export interface ScoreReply {
    scores: Score[]
}

export interface PagesReply {
    pages: number;
}