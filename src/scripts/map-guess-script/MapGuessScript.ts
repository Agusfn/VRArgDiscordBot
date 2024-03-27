import { Script } from "@core/Script";
import { DiscordClientWrapper } from "@core/DiscordClient";

export class MapGuessScript extends Script {

    protected scriptTitle = "Map Guess Script";

    public partidaEnCurso = false;
    public palabraSecreta = '';
    public canalDeJuego = '';
    public temporizador: NodeJS.Timeout;

    constructor(public client: DiscordClientWrapper) {
        super(client);
    }

}