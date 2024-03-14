import { Script } from "@core/Script";
import { DiscordClientWrapper } from "@core/DiscordClient";
import { PlayerBirthdayManager } from "./services/PlayerBirthdayManager";
import { BirthdayAnnouncements } from "./services/BirthdayAnnouncements";
import { PeriodicBirthdayFetcher } from "./services/PeriodicBirthdayFetcher";
import { TextChannel } from "discord.js";
import * as cron from "node-cron"


export class BirthdayScript extends Script {

  protected scriptTitle = "Birthday Script";

  public playerBirthdayManager = new PlayerBirthdayManager();

  private birthdayAnnouncements = new BirthdayAnnouncements();

  private periodicBirthdayFetcher = new PeriodicBirthdayFetcher(this.birthdayAnnouncements);
  
  constructor(public client: DiscordClientWrapper) {
      super(client);
  }

  async onReady() {

    const channel = this.client.getChannel(process.env.CHANNEL_ID_GENERAL) as TextChannel;
    this.birthdayAnnouncements.setOutputChannel(channel);

    this.periodicBirthdayFetcher.checkUsersBirthdays();

    // Each day at 00:00, check for users with birthday today
    cron.schedule("0 12 * * *", async () => {
        this.periodicBirthdayFetcher.checkUsersBirthdays();
    });    
  }

}