import { Script } from "@core/Script";
import { DiscordClientWrapper } from "@core/DiscordClient";
import { ButtonInteraction, CacheType, TextChannel } from "discord.js";
import { handleSellCardCommand } from "./commands/cartas";
import { UserCard } from "./models";
import { Op } from "sequelize";

export class RankedCardScript extends Script {

    protected scriptTitle = "Ranked Card Script";

    private reminderChannel: TextChannel;

    private remindedUsers: string[] = [];

    constructor(public client: DiscordClientWrapper) {
        super(client);
    }

    async onReady() {
        this.reminderChannel = this.client.getChannel(process.env.CHANNEL_ID_USER_COMMANDS) as TextChannel;

        DiscordClientWrapper.getInstance().on('interactionCreate', async interaction => {
            if (!interaction.isButton()) return;
        
            const customId = interaction.customId;
            const [action, cardId] = customId.split("_");
        
            if (action === "sellcard") {
                try {
                    await interaction.reply({ content: 'Vendiendo carta ' + cardId + '...', ephemeral: true });
                    handleSellCardCommand(interaction, cardId);
                } catch (error) {
                    console.error('Error al vender la carta:', error);
                    await interaction.reply({ content: 'Hubo un error al intentar vender tu carta.', ephemeral: true });
                }
            }
        });

        //recordatorios
        const checkReminders = async () => {
            const now = new Date();
            const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000);
        
            const usersToRemind = await UserCard.findAll({
                where: {
                    sendReminder: true,
                    lastDraw: {
                        [Op.lt]: twentyThreeHoursAgo
                    }
                }
            });
        
            for (const user of usersToRemind) {
                if (!this.remindedUsers.includes(user.discordUserId)) {
                    // Envía el recordatorio y agrega el usuario a la lista
                    this.reminderChannel.send(`<@${user.discordUserId}>, ¡es hora de abrir nuevas cartas!`);
                    this.remindedUsers.push(user.discordUserId);
                }
            }
        };
        
        // Inicia la tarea de verificación cada 3 minutos
        setInterval(checkReminders, 3 * 60 * 1000);
    }

    public clearUserReminder(userId: string) {
        this.remindedUsers = this.remindedUsers.filter(id => id !== userId);
    }

}