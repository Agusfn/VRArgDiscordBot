import { VoiceChannel/*, VoiceConnection, StreamDispatcher*/ } from "discord.js"
import * as path from 'path'
import * as fs from "fs"

interface PlayQueueItem {
    /** Absolute path */
    soundFilePath: string,
    channel: VoiceChannel,
    volume: number
}

export default class BotVoiceActions {

    /**
     * Current channel connection
     */
    //private static currentConnection: VoiceConnection

    /**
     * Current Stream Dispatcher (used to dispatch stream over voice channel). It will live and die at the same time with currentConnection.
     */
    /*private static currentDispatcher: StreamDispatcher

    private static playQueue: PlayQueueItem[] = []*/


    /**
     * Play a certain sound in a certain channel, and leave after it has finished.
     * If called while playing a sound in another channel, it will enqueue this action until it has finished.
     * The excecution will finish after the sound dispatcher was created, not after the sound finished playing.
     */
    /*public static async playSoundInChannel(channel: VoiceChannel, soundFileName: string, volume?: number) {

        const filePath = path.join(__dirname, "../../resources/mp3/"+soundFileName)

        if(!fs.existsSync(filePath)) {
            console.log("File doesn't exist!")
            return
        }

        if(this.currentConnection != null || this.currentDispatcher != null) { // bot is connected in a channel (playing a sound) right now
            this.playQueue.push({
                soundFilePath: filePath, 
                channel: channel,
                volume: volume
            })
            return
        }

        try {
            await this.joinChannel(channel)
            this.playSoundInCurrentChannel(filePath, volume)
        } catch(error) { // problem joining channel
            console.log(error)
        }
    }*/


    /**
     * 
     * @param filePath absolute sound file path
     */
    /*private static playSoundInCurrentChannel(filePath: string, volume?: number) {
        
        // Create a dispatcher
        console.log("path", filePath)
        this.currentDispatcher = this.currentConnection.play(filePath, {volume: volume})
        
        this.currentDispatcher.on('start', () => {
            console.log('audio.mp3 is now playing!');
        });

        this.currentDispatcher.on('finish', this.onSoundPlayFinish.bind(this));

        // Always remember to handle errors appropriately!
        this.currentDispatcher.on('error', console.error);
    }
*/

    /**
     * Called when a sound finished playing.
     */
    /*private static async onSoundPlayFinish() {
        console.log("audio stopped")
        setTimeout(async () => {
            if(this.playQueue.length >= 1) {

                const nextPlay = this.playQueue[0]
                this.playQueue.shift()
    
                // switch channel if different
                try {
                    if(nextPlay.channel.id != this.currentConnection.channel.id) {
                        await this.joinChannel(nextPlay.channel)
                    }
        
                    this.playSoundInCurrentChannel(nextPlay.soundFilePath, nextPlay.volume)
                } catch(error) { // most likely problem joining channel
                    console.log(error)
                }

            } else {
                this.leaveChannel()
            }
        }, 1000)

    }*/


    /**
     * Join a certain voice channel.
     * @param channel 
     */
    /*private static async joinChannel(channel: VoiceChannel) {
        this.currentConnection = await channel.join()
    }*/

    /**
     * Leaves channel. If there's no channel, nothing will happen.
     */
    /*private static async leaveChannel() {
        this.currentDispatcher.destroy()
        this.currentDispatcher = null
        this.currentConnection.disconnect()
        this.currentConnection = null
    }*/

}