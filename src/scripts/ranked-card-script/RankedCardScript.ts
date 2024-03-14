import { Script } from "@core/Script";
import { DiscordClientWrapper } from "@core/DiscordClient";
import { ButtonInteraction, CacheType } from "discord.js";
import { handleSellCardCommand } from "./commands/cartas";

export class RankedCardScript extends Script {

    protected scriptTitle = "Ranked Card Script";

    constructor(public client: DiscordClientWrapper) {
        super(client);

        DiscordClientWrapper.getInstance().on('interactionCreate', async interaction => {
            if (!interaction.isButton()) return;
        
            const customId = interaction.customId;
            const [action, cardId] = customId.split("_");
        
            if (action === "sellcard") {
                try {
                    handleSellCardCommand(interaction, parseInt(cardId));
                } catch (error) {
                    console.error('Error al vender la carta:', error);
                    await interaction.reply({ content: 'Hubo un error al intentar vender tu carta.', ephemeral: true });
                }
            }
        });

    }

}