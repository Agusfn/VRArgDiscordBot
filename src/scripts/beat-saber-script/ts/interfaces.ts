import { UserI } from "@ts/interfaces"
import { Leaderboard } from "../model"

export interface PlayerScoreI {
    /** Internal id to identify score. Does not reflect any id in ScoreSaber API. Differs from ssId because there may be multiple scores of a player in a given map. */
    id: number
    /** Id of score in ScoreSaber. In ScoreSaber, each player may only have 1 score per map, subsequent submits are improvements of said score. */
    ssId: number
    /** Id of ScoreSaber player (FK with SSPlayer) */
    playerId: string
    /** If of played leaderboard/map (FK with Leaderboard) */
    leaderboardId: number
    /** World rank set for this score at the time of submitting it (may get outdated quickly) */
    rank: number
    /** Base score subject to modifiers multiplier. */
    baseScore: number
    /** Modified and final score. This determines the accuracy of the score. In most cases it's the same as baseScore since modifiers are not used. */
    modifiedScore: number
    /** Total unweighted pp scored (not the contributed pp). */
    pp: number
    /** Percentage of modified score against max score for this leaderboard. */
    accuracy: number
    /** Weight for pp contribution for this score at the time of setting it (may get outdated quickly) */
    weight: number
    /** Modifiers CSV list. Example: "DA,FS" */
    modifiers: string
    /** Multiplier of score for the given modifiers. Without modifiers it is 1. */
    multiplier: number
    /** Old scores may have this value as zero. */
    badCuts: number
    /** Old scores may have this value as zero. */
    missedNotes: number
    /** Old scores may have this value as zero. */
    maxCombo: number
    /** In old scores this may be false. */
    fullCombo: boolean
    /** Date and time in which this score was set. */
    timeSet: Date

    /** For eager loading from sequelize */
    SSPlayer?: SSPlayerI
    Leaderboard?: Leaderboard
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

    /** Whether all historic scores (from the time of registration to past) have been fetched from this player, and they are all saved in DB. */
    fetchedAllScoreHistory: boolean
    /** 
     * The last page that was fetched from score history. Is used only in the process of fetching historic scores to be able to resume fetching after any interruption. 
     * When registering any SSPlayer, their score pages are fetched from 1 (most recent) to N (oldest), ignoring any repeated scores.
     * So if a new page is inserted while in the fetching process, it will only result in fetching two duplicate pages, but the fetcher will still iterate until the last page (n+1).
     * The new pages will be fetched by periodic fetcher.
     */
    lastHistoryFetchPage: number
    /** Last time the new scores of this SS Player were fetched from ScoreSaber API. Is useful to prioritize players in case of limitations of fetching API. */
    lastPeriodicScoreFetch: Date
    /** Whether this player is subscribed for milestone announcements in the milestone announcements channel. */
    milestoneAnnouncements: boolean

    createdAt: Date
    updatedAt: Date

    /** For eager loading from sequelize */
    User?: UserI
}


export interface LeaderboardI {
    /** ScoreSaber leaderboard id */
    id: number
    /** Another identification for this Leaderboard/map */
    songHash: string
    /** Self explanatory */
    songName: string
    /** Subtitle of song. Empty in most cases apparently. */
    songSubName: string
    /** Artist maker of the song. */
    songAuthorName: string
    /** Mapper */
    levelAuthorName: string
    /** The specific difficulty number of the map of this song. 7 is expert. 9 is expert+ */
    difficultyNumber: number
    /** String that contains the difficulty name and gamemode. For example: "_ExpertPlus_SoloStandard" */
    difficultyName: string
    /** The maximum score that can be achieved with 100% acc */
    maxScore: number
    /** Date in which this map got created in ScoreSaber */
    createdDate: Date
    /** Date in which this map got ranked */
    rankedDate?: Date
    /** Date in which this map got qualified (previous step to ranked) */
    qualifiedDate?: Date
    /** Whether this map is ranked or not */
    ranked: boolean
    /** Whether this map was qualified */
    qualified: boolean
    /** The amount of stars of this map. It's the number that best describes its difficulty. */
    stars: number
    /** Image URL of the cover of the song/map */
    coverImage: string
}




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