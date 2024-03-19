import { DiscordCommand } from "@ts/interfaces";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { RankedCardScript } from "../RankedCardScript";
import { findOrCreateUser, findUserCardById, updateLastDraw } from "../services/UserCardManager";
import logger from "@utils/logger";
import { addCardId, drawCardFromData, drawMapShowCase, generateHashCard, generateRandomCard } from "../services/RankedCardGenerator";
import { calculateCardPrice, findAllTopCard, findCard, findCardByBsr, findCardById, findTopCard, saveCard, updateCardOwnership } from "../services/RankedCardManager";
import { drawUserDeck, placeCard, removeCardFromPosition, removeFromUserDeck } from "../services/UserDeckManager";
import { RankedCard, UserCard, UserDeck } from "../models";
import { DiscordClientWrapper } from "@core/DiscordClient";
import sequelize from "@core/sequelize";
import { Op, Transaction } from "sequelize";
import { getBeatSaverInfo } from "../services/ApiFunctions";

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
                .setName('topglobal')
                .setDescription('Muestra la carta top global')
        ).addSubcommand(subcommand =>
            subcommand
                .setName('perfil')
                .setDescription('Muestra tu expositor de cartas')
        ).addSubcommand(subcommand =>
            subcommand
                .setName('buscar')
                .setDescription('Busca entre tus cartas, puedes buscar por nombre, artista, mapper o id (bsr)')
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
        ).addSubcommand(subcommand =>
            subcommand
                .setName('cambiar')
                .setDescription('Propone un intercambio de cartas con otro usuario. Vence luego de 30 segundos.')
                .addIntegerOption(option =>
                    option.setName('id_carta_a_dar')
                        .setDescription('ID de tu carta que deseas dar en el intercambio')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('id_carta_a_recibir')
                        .setDescription('ID de la carta que deseas recibir en el intercambio')
                        .setRequired(true))
        ).addSubcommand(subcommand =>
            subcommand
                .setName('aceptar')
                .setDescription('Acepta el intercambio propuesto')
        ).addSubcommand(subcommand =>
            subcommand
                .setName('rechazar')
                .setDescription('Rechaza el intercambio propuesto')
        ).addSubcommand(subcommand =>
            subcommand
                .setName('vender')
                .setDescription('Vende una de tus cartas.')
                .addIntegerOption(option =>
                    option.setName('id')
                        .setDescription('ID de la carta que deseas vender')
                        .setRequired(true))
        ).addSubcommand(subcommand =>
            subcommand
                .setName('dinero')
                .setDescription('Muestra cuánto dinero tienes.')
        ).addSubcommand(subcommand =>
            subcommand
                .setName('comprar')
                .setDescription('Compra un paquete de 4 cartas por 1000 pesos y lo abre.')
        ).addSubcommand(subcommand =>
            subcommand
                .setName('mapa')
                .setDescription('Muestra las cartas que tienes del mapa especificado.')
                .addStringOption(option =>
                    option
                        .setName('bsr')
                        .setDescription('Bsr del mapa a mostrar')
                        .setRequired(true)
                    )
        ).addSubcommand(subcommand =>
            subcommand
                .setName('recordar')
                .setDescription('Activa un recordatorio para abrir tu siguiente paquete de cartas.')
        ).addSubcommand(subcommand =>
            subcommand
                .setName('mostrar')
                .setDescription('Muestra una de tus cartas.')
                .addIntegerOption(option =>
                    option.setName('id')
                        .setDescription('ID de la carta que deseas mostrar')
                        .setRequired(true))
        ),
    async execute(script, interaction) {
        // Asegurarse de que estamos manejando un comando
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;

        if (commandName === 'cartas') {
            if (interaction.options.getSubcommand() === 'abrir') {
                await interaction.deferReply();
                const transaction = await sequelize.transaction();
                await openCardPack([], interaction, transaction, false);
                await transaction.commit();
            }
            else if (interaction.options.getSubcommand() === 'top') {
                await interaction.deferReply();
                await openTopCard(interaction);
            }
            else if (interaction.options.getSubcommand() === 'topglobal') {
                await interaction.deferReply();
                await openTopCardGlobal(interaction);
            }
            else if (interaction.options.getSubcommand() === 'perfil') {
                await interaction.deferReply();
                await drawUserDeck(interaction);
            }
            else if (interaction.options.getSubcommand() === 'buscar') {
                await interaction.deferReply();
                const searchText = interaction.options.getString('texto');
                await handleSearchCommand(interaction, searchText);
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
            else if (interaction.options.getSubcommand() === 'cambiar') {
                await handleTradeCommand(interaction);
            }
            else if (interaction.options.getSubcommand() === 'aceptar') {
                await handleAcceptTradeCommand(interaction);
            }
            else if (interaction.options.getSubcommand() === 'rechazar') {
                await handleDenyTradeCommand(interaction);
            }
            else if (interaction.options.getSubcommand() === 'vender') {
                await handleSellCardCommand(interaction, interaction.options.getInteger('id'));
            }
            else if (interaction.options.getSubcommand() === 'dinero') {
                await handleMoneyCommand(interaction);
            }
            else if (interaction.options.getSubcommand() === 'comprar') {
                await interaction.deferReply();
                await handleBuyCardCommand(interaction);
            }
            else if (interaction.options.getSubcommand() === 'mapa') {
                await interaction.deferReply();
                const bsr = interaction.options.getString('bsr');
                await handleMapCommand(interaction, bsr);
            }
            else if (interaction.options.getSubcommand() === 'recordar') {
                await interaction.deferReply();
                const userCarta = await findOrCreateUser(interaction.user.id);
                userCarta[0].sendReminder = true;
                await userCarta[0].save();
                await interaction.followUp(`Recordatorio activado. Recibirás un recordatorio cuando puedas sacar cartas nuevamente.`);
            }
            else if (interaction.options.getSubcommand() === 'mostrar') {
                await handleShowCardCommand(interaction, interaction.options.getInteger('id'));
            }
        }
    },
} as DiscordCommand<RankedCardScript>;

async function openCardPack(args: string[], interaction: ChatInputCommandInteraction<CacheType>, transaction: Transaction, buy: boolean) {
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
            if (hoursSince < 23 && !buy) {
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
                if(userCarta[0].sendReminder) {
                    await interaction.followUp("Che, me pediste que te avisara y eso voy a hacer.. o no confias en mi?");
                    const tiempoRestantesito = (horasRestantes > 0 ? (horasRestantes + " horita" + (horasRestantes == 1 ? ", " : "s, ")) : "") + 
                                        (minutosRestantes > 0 ? (minutosRestantes + " minutito" + (minutosRestantes == 1 ? " y " : "s y ")) : "") + 
                                        segundosRestantes + " segundito" + (segundosRestantes == 1 ? "" : "s");
                    await delay(800);
                    await interaction.channel.send("Podés aguantar " + tiempoRestantesito + "?");
                }
                else {
                    await interaction.followUp("Tenés que esperar " + tiempoRestante + " antes de poder sacar cartas de nuevo");
                    if(hoursSince < 1) {
                        await delay(1000);
                        await interaction.channel.send("Ni una hora ha pasado...");
                    }
                    await interaction.channel.send("Usa **/cartas recordar** si desea recibir un recordatorio cuando puedas abrir cartas nuevamente.");
                }
                return;
            }
            else {
                updateLastDraw(interaction.user.id, now, transaction);
            }
        }
        catch(error) {
            logger.error(error);
            interaction.followUp("Hubo un error al intentar generar la/s carta/s.");
            await transaction.rollback();
            return;
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
                cardPrices.push(calculateCardPrice(generatedCard[1]))
                const cardData = generatedCard[1];
                cardData.userCardId = userCarta[0].id;                       
                let cartId = await saveCard(cardData, transaction);
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
        interaction.followUp("Hubo un error al intentar generar la/s carta/s.");
        await transaction.rollback();
    }
}

async function openTopCardGlobal(interaction: ChatInputCommandInteraction<CacheType>) {
    try {
        const carta = await findAllTopCard();
        if(carta) {
            let cartaGenerada = await drawCardFromData(carta);
            cartaGenerada[0] = await addCardId(cartaGenerada[0], carta.id);
            await sendCard(interaction, cartaGenerada[0]);
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
            await sendCard(interaction, cartaGenerada[0]);
            await sendButton(interaction, carta.id, calculateCardPrice(cartaGenerada[1]));
        }
        else {
            interaction.followUp("Ché no tenés cartas");
        }

    } catch (error) {
        logger.error(error);
        interaction.followUp("Hubo un error al intentar obtener la carta.")
    }
}

async function handleSearchCommand(interaction: ChatInputCommandInteraction<CacheType>, searchText: string) {
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
            where: { 
                userCardId: userId,
                [Op.or]: [
                    { bsr: { [Op.like]: `%${searchText}%` } },
                    { songName: { [Op.like]: `%${searchText}%` } },
                    { songSubName: { [Op.like]: `%${searchText}%` } },
                    { songAuthorName: { [Op.like]: `%${searchText}%` } },
                    { levelAuthorName: { [Op.like]: `%${searchText}%` } },
                ],
            },
            order: [['id', 'DESC']], // Ordena por ID de mayor a menor
            limit: pageSize,
            offset: offset,
        });

        if (rows.length === 0) {
            await interaction.reply('No se encontraron cartas.');
            return;
        }

        // Formatea las cartas para el mensaje
        
        const cardsList = rows.map((card, index) => `${offset + index + 1}. ${cardToText(card)}, Valor: **${calculateCardPrice(card)}** pesos`).join('\n');
        const totalPages = Math.ceil(count / pageSize);

        await interaction.followUp("**Resultados** - Página " + page + " de " + totalPages + "\n" + cardsList);

    } catch (error) {
        console.error('Error al mostrar el resultado:', error);
        await interaction.followUp('Hubo un error al intentar mostrar tu busqueda de cartas o la página no existe.');
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
        
        const cardsList = rows.map((card, index) => `${offset + index + 1}. ${cardToText(card)}, Valor: **${calculateCardPrice(card)}** pesos`).join('\n');
        const totalPages = Math.ceil(count / pageSize);

        await interaction.followUp("**Inventario de Cartas" + (top?" Top":"") + "** - Página " + page + " de " + totalPages + "\n" + cardsList);

    } catch (error) {
        console.error('Error al mostrar el inventario:', error);
        await interaction.followUp('Hubo un error al intentar mostrar tu inventario de cartas o la página no existe.');
    }
}

function cardToText(card: RankedCard) {
    const difficultySquares = ["",":green_square:","",":blue_square:","",":green_square:","",":red_square:","",":purple_square:"];
    return `${difficultySquares[card.difficulty] + " **" + card.songName}**, Estrellas: **${card.stars}**, ID: **${card.id}**${card.shiny?" :rainbow:":""}`
}

const tradeProposals = new Map(); // userId a la propuesta

async function handleTradeCommand(interaction: ChatInputCommandInteraction<CacheType>) {
    const cardToGiveId = interaction.options.getInteger('id_carta_a_dar');
    const cardToReceiveId = interaction.options.getInteger('id_carta_a_recibir');
    const userCarta = await findOrCreateUser(interaction.user.id);
    const userId = userCarta[0].id;

    // Verifica que ambas cartas existan
    const cardToGive = await RankedCard.findByPk(cardToGiveId);
    const cardToReceive = await RankedCard.findByPk(cardToReceiveId);

    const receiverUser = await findUserCardById(cardToReceive.userCardId);
    const receiverDiscordId = receiverUser.discordUserId;

    if (!cardToGive || !cardToReceive) {
        await interaction.reply('Una o ambas cartas no existen.');
        return;
    }

    // Verifica que la carta a dar pertenece al usuario y la carta a recibir no
    if (cardToGive.userCardId !== userId || cardToReceive.userCardId === userId) {
        await interaction.reply('No puedes intercambiar cartas que no te pertenecen o intercambiar por una carta que ya es tuya.');
        return;
    }

    // Verificar si ya existe una propuesta en curso para este usuario
    if (tradeProposals.has(userId)) {
        const existingProposal = tradeProposals.get(userId);
        // Verificar si aún está en el tiempo límite de espera
        if (Date.now() - existingProposal.timestamp < 30000) { // 30 segundos
            await interaction.reply('Ya tienes una propuesta de intercambio en curso. Por favor espera.');
            return;
        }
    }

    // Aquí sigue tu lógica para verificar las cartas y demás condiciones

    // Si pasa todas las verificaciones, almacenar la propuesta con un timestamp
    const timestamp = Date.now();
    tradeProposals.set(userId, { 
        cardToGiveId, 
        cardToReceiveId, 
        senderId: cardToGive.userCardId,
        receiverId: cardToReceive.userCardId, 
        timestamp 
    });

    const receiverDiscordUser = await DiscordClientWrapper.getInstance().users.fetch(receiverDiscordId);
    await interaction.reply(`**Propuesta de intercambio enviada:** ${receiverDiscordUser.displayName} tiene 30 segundos para aceptar.`);
    await interaction.channel.send("**"+interaction.user.displayName + "** recibe: " + cardToText(cardToReceive) + " de **" + receiverDiscordUser.displayName+"**");
    await interaction.channel.send("**"+receiverDiscordUser.displayName + "** recibe: " + cardToText(cardToGive) + " de **" + interaction.user.displayName+"**");
    await interaction.channel.send("Usa **/cartas** (aceptar/rechazar)");

    // Establecer un temporizador para eliminar la propuesta después de 30 segundos si no se acepta
    setTimeout(() => {
        const currentProposal = tradeProposals.get(userId);
        // Verifica si la propuesta aún existe y coincide con el timestamp original
        if (currentProposal && currentProposal.timestamp === timestamp) {
            tradeProposals.delete(userId);
            // Notificar al usuario que su propuesta de intercambio ha expirado podría ser aquí, pero depende de si tienes una forma de enviarles un mensaje en este punto.
        }
    }, 30000);
}

async function handleAcceptTradeCommand(interaction: ChatInputCommandInteraction<CacheType>) {
    const userCarta = await findOrCreateUser(interaction.user.id);
    const userId = userCarta[0].id;

    // Verificar si hay una propuesta de intercambio dirigida al usuario
    const proposal = [...tradeProposals.values()].find(proposal => proposal.receiverId === userId);

    if (!proposal) {
        await interaction.reply('No tienes ninguna propuesta de intercambio pendiente.');
        return;
    }


    // Verificar si la propuesta ha expirado
    if (Date.now() - proposal.timestamp >= 30000) { // 30 segundos
        await interaction.reply('La propuesta de intercambio ha expirado.');
        tradeProposals.delete(proposal.receiverId); // Limpiar la propuesta expirada
        return;
    }

    const transaction = await sequelize.transaction();
    await removeFromUserDeck(transaction, proposal.cardToGiveId, proposal.cardToReceiveId);
    await updateCardOwnership(transaction, proposal.cardToGiveId, proposal.receiverId, proposal.cardToReceiveId, proposal.senderId);
    await transaction.commit();

    await interaction.reply('Intercambio completado con éxito.');
}

async function handleDenyTradeCommand(interaction: ChatInputCommandInteraction<CacheType>) { 
    const userCarta = await findOrCreateUser(interaction.user.id);
    const userId = userCarta[0].id;

    // Verificar si hay una propuesta de intercambio dirigida al usuario
    const proposal = [...tradeProposals.values()].find(proposal => proposal.receiverId === userId);

    if (!proposal) {
        await interaction.reply('No tienes ninguna propuesta de intercambio pendiente.');
        return;
    }
    tradeProposals.delete(proposal.receiverId);
    await interaction.reply('Intercambio rechazado con éxito.');
}

export async function handleSellCardCommand(interaction: any, cardId: number) {
    const userCarta = await findOrCreateUser(interaction.user.id);
    const userId = userCarta[0].id;

    const transaction = await sequelize.transaction();

    try {
        // Buscar la carta y verificar que pertenezca al usuario
        const card = await RankedCard.findOne({ where: { id: cardId, userCardId: userId } });

        if (!card) {
            await interaction.reply('No se encontró la carta o no te pertenece.');
            return;
        }

        // Calcular el precio de la carta
        const price = calculateCardPrice(card);

        // Actualizar el dinero del usuario en UserCard
        await UserCard.increment('money', { by: price, where: { id: userId }, transaction });

        // Eliminar la carta de RankedCard y UserDeck
        await UserDeck.destroy({ where: { cardId }, transaction });
        await RankedCard.destroy({ where: { id: cardId }, transaction });
        

        await transaction.commit();
        await interaction.reply(`Has vendido la carta ${cardToText(card)} por **${price}** pesos.`);
    } catch (error) {
        await transaction.rollback();
        console.error('Error al vender la carta:', error);
        await interaction.reply('Hubo un error al intentar vender tu carta.');
    }
}

async function handleMoneyCommand(interaction: ChatInputCommandInteraction<CacheType>) {
    const userCarta = await findOrCreateUser(interaction.user.id);
    const userId = userCarta[0].id;

    try {
        // Buscar el registro de UserCard del usuario
        const userCard = await UserCard.findOne({ where: { id: userId } });

        if (!userCard) {
            await interaction.reply('No se encontró información de dinero para tu usuario.');
            return;
        }

        await interaction.reply(`Tienes un total de ${userCard.money} pesos.`);
    } catch (error) {
        console.error('Error al obtener el dinero del usuario:', error);
        await interaction.reply('Hubo un error al intentar mostrar tu dinero.');
    }
}

async function handleBuyCardCommand(interaction: ChatInputCommandInteraction<CacheType>) {
    const userCarta = await findOrCreateUser(interaction.user.id);
    const userId = userCarta[0].id;
    const price = 1000; // Costo del paquete

    const transaction = await sequelize.transaction();
    try {
        // Inicia una transacción
        

        // Verifica el saldo actual del usuario
        const userCard = await UserCard.findOne({ where: { id: userId } ,  transaction });

        if (!userCard || userCard.money < price) {
            await interaction.followUp('No tienes suficiente guita para comprar un paquete de cartas. Necesitas 1000 pesos.');
            return;
        }

        // Descuenta el precio de la carta del saldo del usuario
        await UserCard.update({ money: userCard.money - price }, {
            where: { id: userId },
            transaction
        });
        await interaction.followUp('Abriendo paquete de 4 cartas por 1000 pesos...');

        await openCardPack([], interaction, transaction, true);
        
        // Si todo sale bien, confirmas la transacción
        await transaction.commit();

        await interaction.followUp('Compra realizada con éxito.');
    } catch (error) {
        console.error('Error al comprar la carta:', error);
        await transaction.rollback();
        await interaction.followUp('Hubo un error al intentar comprar la carta. Tu dinero ha sido devuelto.');
    }
}

async function handleMapCommand(interaction: ChatInputCommandInteraction<CacheType>, bsr: string) {
    try {
        const cards = await findCardByBsr(interaction.user.id, bsr);
        if(!cards) {
            interaction.followUp("No");
            return;
        }
        const hash = cards[0].hash;
        const beatSaverInfo = await getBeatSaverInfo(hash);
        
        let diffExist = [false,false,false,false,false];
        const diffsNames = ["Easy","Normal","Hard","Expert","ExpertPlus"];
        const diffsVal = [1,3,5,7,9];
        const cardsSorted = []
        for(var i = 0; i < beatSaverInfo.versions[0].diffs.length; i++) {
            let diff = beatSaverInfo.versions[0].diffs[i];
            if(diff.characteristic != 'Standard') {
                continue;
            }
            if(!diff.stars || diff.stars <= 0) {
                continue;
            }
            for(var j = 0; j < diffsNames.length; j++) {
                if(diff.difficulty == diffsNames[j]) {
                    diffExist[j] = true;
                    for(var k = 0; k < cards.length; k++) {
                        if(diffsVal[j] == cards[k].difficulty) {
                            cardsSorted[j] = cards[k];
                        }
                    }
                }
            }
        }
        await interaction.followUp({ 
            files: [{
                    attachment: await drawMapShowCase(diffExist, cardsSorted, interaction.user),
                    name: "map.png" 
        }]});


    } catch (error) {
        logger.error(error);
        interaction.followUp("Hubo un error al intentar obtener la carta.")
    }
}

async function handleShowCardCommand(interaction: ChatInputCommandInteraction<CacheType>, cardId: number) {
    try {
        const cards = await findCardById(cardId);
        const carta = cards[0];
        if(carta) {
            let cartaGenerada = await drawCardFromData(carta);
            cartaGenerada[0] = await addCardId(cartaGenerada[0], carta.id);
            await sendCard(interaction, cartaGenerada[0]);
            await sendButton(interaction, carta.id, calculateCardPrice(cartaGenerada[1]));
        }
        else {
            interaction.followUp("No se encontro ninguna carta con la id especificada");
        }
    } catch (error) {
        logger.error(error);
        interaction.followUp("Hubo un error al intentar obtener la carta.")
    }
}