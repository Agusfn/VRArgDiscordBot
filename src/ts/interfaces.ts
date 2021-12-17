import { Message } from "discord.js"
import { CommandType } from "./enums"


export type CommandActionFunction = (...args: any) => any

/**
 * A command, which is the medium of interaction with this bot. These commands are "classic" plain text discord message commands, not Discord Slash Commands.
 */
export interface BotCommand {
    type: CommandType,
    name: string,
    args?: string,
    description?: string,
    //commandAction: CommandActionFunction,
    /** Only for public commands. Id of channel if restricted. */
    restrictedChannelId?: string
}


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
    rank: number,
    scoreId: number,
    score: number,
    unmodifiedScore: number,
    mods: string,
    pp: number,
    weight: number,
    timeSet: string,
    leaderboardId: number,
    songHash: string,
    songName: string,
    songSubName: string,
    songAuthorName: string,
    levelAuthorName: string,
    difficulty: string,
    difficultyRaw: string,
    maxScore: number
}

export interface ScoreReply {
    scores: Score[]
}

export interface PagesReply {
    pages: number;
}

export interface UserRankInfo {
    discordUserId: string,
    globalRank: number
}


