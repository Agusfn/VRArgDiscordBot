import { Script } from "@core/Script";
import { HistoricScoreFetcher, PeriodicScoreFetcher, PlayerProfileUpdater } from "./services";

export class BeatSaberScript extends Script {

    protected scriptName = "Beat Saber Script";
    
    private periodicScoreFetcher = new PeriodicScoreFetcher();
    private historicScoreFetcher = new HistoricScoreFetcher();
    private playerProfileUpdater = new PlayerProfileUpdater();

}