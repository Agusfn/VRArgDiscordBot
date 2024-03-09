import { DiscordCommand } from "@ts/interfaces";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, Message, SlashCommandBuilder } from "discord.js";
import { RankedCardScript } from "../RankedCardScript";
import { findOrCreateUser, updateLastDraw } from "../services/UserCardManager";
import logger from "@utils/logger";
import { drawCardFromData, generateHashCard, generateRandomCard } from "../services/RankedCardGenerator";
import { calculateCardPrice, findAllTopCard, findTopCard, saveCard } from "../services/RankedCardManager";

export default {
	data: new SlashCommandBuilder()
		.setName('cartas')
		.setDescription('Comandos relacionados con el generador de cartas de mapas ranked de Scoresaber')
        .addSubcommand(subcommand =>
            subcommand
                .setName('sacar')
                .setDescription('Abre un paquete de 4 cartas')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('top')
                .setDescription('Muestra tu carta top')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('global')
                .setDescription('Muestra la carta top global')
        ).addSubcommand(subcommand =>
            subcommand
                .setName('mostrar')
                .setDescription('(Próximamente) Muestra tus cartas seleccionadas')
        ),
    async execute(script, interaction) {
        // Asegurarse de que estamos manejando un comando
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;

        if (commandName === 'cartas') {
            if (interaction.options.getSubcommand() === 'sacar') {
                await interaction.deferReply();
                await openCardPack([], interaction);
            }
            else if (interaction.options.getSubcommand() === 'top') {
                await interaction.deferReply();
                await openTopCard(interaction);
            }
            else if (interaction.options.getSubcommand() === 'global') {
                await interaction.deferReply();
                await openTopCardGlobal(interaction);
            }
            else if (interaction.options.getSubcommand() === 'mostrar') {
                await interaction.reply('(Próximamente)...');
            }
        }
        },
} as DiscordCommand<RankedCardScript>;

async function openCardPack(args: string[], interaction: ChatInputCommandInteraction<CacheType>) {
    let isHash = false;

    if(args.length >=2 && args[0] != null) {
        isHash = true;
    }

    const userCarta = await findOrCreateUser(interaction.user.id);

    if(!isHash) {
        try {

            const lastDraw = userCarta[0].lastDraw ? userCarta[0].lastDraw : new Date(0);
            const now = new Date();
            const timeSince = now.getTime() - lastDraw.getTime();
            
            const hoursSince = timeSince / (1000 * 60 * 60);

            // Verificar si la diferencia es menor a 24 horas
            if (hoursSince < 23) {
                // Convertir a horas, minutos y segundos para mostrar
                const horas = Math.floor(hoursSince);
                const minutos = Math.floor((timeSince / (1000 * 60)) % 60);
                const segundos = Math.floor((timeSince / 1000) % 60);

                // Tiempo restante para completar 24 horas
                const totalSegundosRestantes = (23 * 60 * 60) - (horas * 60 * 60 + minutos * 60 + segundos);
                const horasRestantes = Math.floor(totalSegundosRestantes / 3600);
                const minutosRestantes = Math.floor((totalSegundosRestantes % 3600) / 60);
                const segundosRestantes = totalSegundosRestantes % 60;

                // Formatear el resultado como un string

                const tiempoRestante = (horasRestantes > 0 ? (horasRestantes + " hora" + (horasRestantes == 1 ? ", " : "s, ")) : "") + 
                                        (minutosRestantes > 0 ? (minutosRestantes + " minuto" + (minutosRestantes == 1 ? " y " : "s y ")) : "") + 
                                        segundosRestantes + " segundo" + (segundosRestantes == 1 ? "" : "s");
                
                function delay(ms: number) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                await interaction.followUp("Tenés que esperar " + tiempoRestante + " antes de poder sacar cartas de nuevo");
                if(hoursSince < 1) {
                    await delay(1023);
                    await interaction.channel.send("Ni una hora ha pasado...");
                }
                return;
            }
            else {
                updateLastDraw(interaction.user.id, now);
            }
        }
        catch(error) {
            logger.error(error);
        }
    }

    try {

        let imageBuffers = [];
        let cardPrices = [];
        let cardIds = [];
        
        if(isHash) {
            let generatedCard = await generateHashCard(args[0], parseInt(args[1]));
            imageBuffers.push(generatedCard[0]);
            cardPrices.push(0);
        }
        else {
            let generatedCard;
            for(var i = 0; i < 4; i++) {
                let shiny = 500*Math.random() < 1;
                generatedCard = await generateRandomCard(interaction.user.username, shiny);
                imageBuffers.push(generatedCard[0]);
                cardPrices.push(calculateCardPrice(generatedCard[1].stars,generatedCard[1].curated,generatedCard[1].chroma,generatedCard[1].shiny))
                const cardData = generatedCard[1];
                cardData.userCardId = userCarta[0].id;                       
                let cartId = await saveCard(cardData);
                cardIds.push(cartId);
            }
        }
        // Enviar carta
        for(var i = 0; i < imageBuffers.length; i++) {
            await sendCard(interaction, imageBuffers[i]);
            await sendButton(interaction, cardIds[i], cardPrices[i]);
        }                

    } catch (error) {
        logger.error(error);
        interaction.followUp("Hubo un error al intentar generar la/s carta/s.")
    }
}

async function openTopCardGlobal(interaction: ChatInputCommandInteraction<CacheType>) {
    try {
        const carta = await findAllTopCard();
        if(carta) {
            let cartaGenerada = await drawCardFromData(carta);
            sendCard(interaction, cartaGenerada[0]);
        }
        else {
            interaction.followUp("No hay cartas");
        }

    } catch (error) {
        logger.error(error);
        interaction.followUp("Hubo un error al intentar obtener la carta.")
    }
}

async function openTopCard(interaction: ChatInputCommandInteraction<CacheType>) {
    try {
        const userCarta = await findOrCreateUser(interaction.user.id);
        const carta = await findTopCard(userCarta[0].id);
        if(carta) {
            let cartaGenerada = await drawCardFromData(carta);
            sendCard(interaction, cartaGenerada[0]);
        }
        else {
            interaction.followUp("Ché no tenés cartas");
        }

    } catch (error) {
        logger.error(error);
        interaction.followUp("Hubo un error al intentar obtener la carta.")
    }
}

async function sendCard(interaction: ChatInputCommandInteraction<CacheType>, imageBuffer: any) {
    await interaction.followUp({ 
        files: [{
                attachment: imageBuffer,
                name: "card.png" 
        }]});
}

async function sendButton(interaction: ChatInputCommandInteraction<CacheType>, cardId: number, cardPrice: number) {
    const button = new ButtonBuilder()
        .setCustomId("sellcard_" + cardId)
        .setLabel('Vender esta carta por ' + cardPrice + ' Pesos')
        .setStyle(ButtonStyle.Secondary);
    
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
    await interaction.channel.send({components: [row] });
}

