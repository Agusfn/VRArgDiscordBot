import { DiscordCommand } from "@ts/interfaces";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { RankedCardScript } from "../RankedCardScript";
import { findOrCreateUser, updateLastDraw } from "../services/UserCardManager";
import logger from "@utils/logger";
import { addCardId, drawCardFromData, generateHashCard, generateRandomCard } from "../services/RankedCardGenerator";
import { calculateCardPrice, findAllTopCard, findCard, findTopCard, saveCard } from "../services/RankedCardManager";
import { drawUserDeck, placeCard, removeCardFromPosition } from "../services/UserDeckManager";
import { RankedCard } from "../models";

export default {
	data: new SlashCommandBuilder()
		.setName('cartas')
		.setDescription('Comandos relacionados con el generador de cartas de mapas ranked de Scoresaber')
        .addSubcommand(subcommand =>
            subcommand
                .setName('abrir')
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
        ).addSubcommand(subcommand =>
            subcommand
                .setName('buscar')
                .setDescription('Busca entre tus cartas, puedes buscar por nombre, artista o mapper')
                .addStringOption(option =>
                    option
                        .setName('texto')
                        .setDescription('Texto a buscar')
                        .setRequired(true)
                    )
        ).addSubcommand(subcommand =>
            subcommand
                .setName('colocar')
                .setDescription('Coloca la carta que elijas en la posicion que elijas')
                .addIntegerOption(option => 
                    option
                        .setName("id")
                        .setDescription('Id de la carta a colocar')
                        .setRequired(true))
                .addIntegerOption(option => 
                    option
                        .setName("posicion")
                        .setDescription('Posición a colocar la carta (0-8)')
                        .setRequired(true))
        ).addSubcommand(subcommand =>
            subcommand
                .setName('quitar')
                .setDescription('Quita la carta que elijas de la posicion que elijas')
                .addIntegerOption(option => 
                    option
                        .setName("posicion")
                        .setDescription('Posición a quitar la carta (0-8)')
                        .setRequired(true))
        ).addSubcommand(subcommand =>
            subcommand
                .setName('inventario')
                .setDescription('Muestra tu inventario de cartas.')
                .addIntegerOption(option =>
                    option
                        .setName('pagina')
                        .setDescription('Número de página para mostrar (opcional)')
                        .setRequired(false)
                )
        ).addSubcommand(subcommand =>
            subcommand
                .setName('inventariotop')
                .setDescription('Muestra tu inventario de cartas top.')
                .addIntegerOption(option =>
                    option
                        .setName('pagina')
                        .setDescription('Número de página para mostrar (opcional)')
                        .setRequired(false)
                )
        ),
    async execute(script, interaction) {
        // Asegurarse de que estamos manejando un comando
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;

        if (commandName === 'cartas') {
            if (interaction.options.getSubcommand() === 'abrir') {
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
                await interaction.deferReply();
                await drawUserDeck(interaction);
            }
            else if (interaction.options.getSubcommand() === 'buscar') {
                await interaction.deferReply();
                const searchText = interaction.options.getString('texto');
                await showFirstResultCard(interaction, searchText);
            }
            else if (interaction.options.getSubcommand() === 'colocar') {
                await interaction.deferReply();
                const cardId = interaction.options.getInteger('id');
                const position = interaction.options.getInteger('posicion');
                const userCarta = await findOrCreateUser(interaction.user.id);
                await placeCard(interaction, userCarta[0].id, cardId, position);
            }
            else if (interaction.options.getSubcommand() === 'quitar') {
                await interaction.deferReply();
                const position = interaction.options.getInteger('posicion');
                const userCarta = await findOrCreateUser(interaction.user.id);
                await removeCardFromPosition(interaction, userCarta[0].id, position);
            }
            else if (interaction.options.getSubcommand() === 'inventario') {
                await interaction.deferReply();
                await handleInventarioCommand(interaction, false);
            }
            else if (interaction.options.getSubcommand() === 'inventariotop') {
                await interaction.deferReply();
                await handleInventarioCommand(interaction, true);
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
                cardPrices.push(calculateCardPrice(generatedCard[1].stars,generatedCard[1].curated,generatedCard[1].chroma,generatedCard[1].shiny))
                const cardData = generatedCard[1];
                cardData.userCardId = userCarta[0].id;                       
                let cartId = await saveCard(cardData);
                cardIds.push(cartId);
                generatedCard[0] = await addCardId(generatedCard[0], cartId);
                imageBuffers.push(generatedCard[0]);
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
            cartaGenerada[0] = await addCardId(cartaGenerada[0], carta.id);
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
            cartaGenerada[0] = await addCardId(cartaGenerada[0], carta.id);
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

async function showFirstResultCard(interaction: ChatInputCommandInteraction<CacheType>, searchText: string) {
    try {
        const cards = await findCard(interaction.user.id, searchText);
        const carta = cards[0];
        if(carta) {
            let cartaGenerada = await drawCardFromData(carta);
            cartaGenerada[0] = await addCardId(cartaGenerada[0], carta.id);
            sendCard(interaction, cartaGenerada[0]);
        }
        else {
            interaction.followUp("No se encontro ninguna carta");
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

async function handleInventarioCommand(interaction: ChatInputCommandInteraction<CacheType>, top: boolean) {
    // Obtén el ID del usuario de Discord
    const userCarta = await findOrCreateUser(interaction.user.id);
    const userId = userCarta[0].id;
    // Verifica si se proporcionó una opción de página, si no, usa la página 1 como predeterminado
    const page = interaction.options.getInteger('pagina') || 1;
    const pageSize = 10; // Número de cartas por página
    const offset = (page - 1) * pageSize;

    try {
        // Suponiendo que tienes una función para obtener las cartas del usuario
        const { count, rows } = await RankedCard.findAndCountAll({
            where: { userCardId: userId },
            order: [[top? 'stars' : 'id', 'DESC']], // Ordena por ID de mayor a menor
            limit: pageSize,
            offset: offset,
        });

        if (rows.length === 0) {
            await interaction.reply('No tienes cartas en tu inventario o la página no existe.');
            return;
        }

        // Formatea las cartas para el mensaje
        const cardsList = rows.map((card, index) => `${offset + index + 1}. ID: **${card.id}**, Nombre: **${card.songName}**, Estrellas: **${card.stars}**`).join('\n');
        const totalPages = Math.ceil(count / pageSize);

        await interaction.followUp("**Inventario de Cartas" + (top?" Top":"") + "** - Página " + page + " de " + totalPages + "\n" + cardsList);

    } catch (error) {
        console.error('Error al mostrar el inventario:', error);
        await interaction.followUp('Hubo un error al intentar mostrar tu inventario de cartas o la página no existe.');
    }
}