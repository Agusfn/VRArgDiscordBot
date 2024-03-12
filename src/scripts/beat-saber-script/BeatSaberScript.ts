import { Script } from "@core/Script";
import { HistoricScoreFetcher, PeriodicScoreFetcher, PlayerProfileUpdater, PlayerScoreSaver, PlayerTriggerEvents, ScoreSaberAccountManager, ScoreSaberDataCache } from "./services";
import * as cron from "node-cron"
import { PlayerAnnouncements } from "./services/PlayerAnnouncements";
import { DiscordClientWrapper } from "@core/DiscordClient";
import { TextChannel } from "discord.js";

export class BeatSaberScript extends Script {


    protected scriptTitle = "Beat Saber General";
    
    private playerAnnouncements = new PlayerAnnouncements();
    private playerTriggerEvents = new PlayerTriggerEvents(this.playerAnnouncements);
    private playerScoreSaver = new PlayerScoreSaver(this.playerTriggerEvents);

    private periodicScoreFetcher = new PeriodicScoreFetcher(this.playerScoreSaver);
    private historicScoreFetcher = new HistoricScoreFetcher(this.playerScoreSaver);
    private playerProfileUpdater = new PlayerProfileUpdater(this.playerTriggerEvents);

    public scoreSaberAccountManager = new ScoreSaberAccountManager(this.historicScoreFetcher);


    constructor(public client: DiscordClientWrapper) {
        super(client);
    }


    async onReady() {

        await ScoreSaberDataCache.initialize();
        await this.playerTriggerEvents.initialize();

        const channel = this.client.getChannel(process.env.CHANNEL_ID_BEATSABER_MILESTONES) as TextChannel;
        this.playerAnnouncements.setOutputChannel(channel);

        // Check new already submitted scores from all players
        this.historicScoreFetcher.checkPlayerHistoricScores();

        // Each 20 minutes, check for any new score recently uploaded
        cron.schedule("*/20 * * * *", () => {
            this.periodicScoreFetcher.checkPlayersNewScores();
        });

        // Each 25 minutes, check for changes in scoresaber players profiles (rank, nickname, etc)
        cron.schedule("*/25 * * * *", () => {
            this.playerProfileUpdater.checkPlayersProfileUpdates();
        });

    }


}