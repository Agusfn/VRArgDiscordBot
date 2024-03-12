import { Script } from "@core/Script";
import { DiscordClientWrapper } from "@core/DiscordClient";
import { PlayerBirthdayManager } from "./services/PlayerBirthdayManager";

export class BirthdayScript extends Script {

  public playerBirthdayManager = new PlayerBirthdayManager();

  protected scriptName = "Birthday Script";

  constructor(public client: DiscordClientWrapper) {
      super(client);
  }

}
