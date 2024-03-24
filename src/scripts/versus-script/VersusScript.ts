import { Script } from "@core/Script";
import { DiscordClientWrapper } from "@core/DiscordClient";
import { sendCoinflip } from "./commands/coinflip";

export class VersusScript extends Script {

    protected scriptTitle = "Versus Script";
    
    constructor(public client: DiscordClientWrapper) {
        super(client);
    }

    async onReady() {

        DiscordClientWrapper.getInstance().on('interactionCreate', async interaction => {
            if (!interaction.isButton()) return;

            const customId = interaction.customId;

            if (customId === "coinflip") {
                await sendCoinflip(interaction);
            }
        });

    }

}