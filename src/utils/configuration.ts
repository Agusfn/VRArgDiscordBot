

export const COMMAND_PREFIX = "/"

/** Logging discord channel id. We temporarily use test-chepibe channel for logging (same as score announcements) */
export const LOGGING_DISCORD_CHANNEL_ID = "856383011443572766"

/**
 * Days between each database file backup. 
 */
export const DATABASE_BACKUP_FRECUENCY_DAYS = 3

/**
 * Hour in which the database has a backup, on the backup days.
 */
export const DATABASE_BACKUP_HOUR = 3


/**
 * Max copies of a file to retain for backup in the rotation
 */
export const DATABASE_BACKUP_MAX_FILES = 5