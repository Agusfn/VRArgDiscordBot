import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { RankedCard } from "../models";
import { UserDeck } from "../models/UserDeck";
import { findOrCreateUser } from "./UserCardManager";
import { createCanvas, loadImage } from "canvas";
import { countCardsByMinimumStars, countUserCards, findCardById, findTopCard } from "./RankedCardManager";
import { drawCardFromData } from "./RankedCardGenerator";
import axios from "axios";
import sharp from "sharp";
import path from "path";

const Canvas = require('canvas');
const resourcesPath = "resources/ranked-cards-script/"
Canvas.registerFont(resourcesPath+'Teko.ttf', { family: 'Teko Medium', weight: 'normal', style: 'normal'});

export async function placeCard(interaction: ChatInputCommandInteraction<CacheType>, userId: number, cardId: number, position: number) {
    try {
        // Asegúrate de que la carta existe y pertenece al usuario
        const card = await RankedCard.findOne({
            where: { 
                id: cardId,
                userCardId: userId 
            }
        });

        if (!card) {
            interaction.followUp("La carta no existe o no te pertenece.");
            return;
        }

        // Verifica si ya existe una carta en la posición deseada
        const existingCard = await UserDeck.findOne({
            where: {
                userId: userId,
                slot: position
            }
        });

        if (existingCard) {
            // reemplazamos la carta existente:
            await existingCard.update({ cardId: card.id });
        } else {
            // Si no hay carta en la posición, crea una nueva entrada en UserDeck
            await UserDeck.create({
                userId: userId,
                cardId: card.id,
                slot: position
            });
        }
        interaction.followUp(`La carta ${card.id} ha sido colocada en la posición ${position}.`);
    } catch (error) {
        console.error('Error al colocar la carta:', error);
        interaction.followUp("Hubo un error al intentar colocar la carta.");
    }
}

export async function removeCardFromPosition(interaction: ChatInputCommandInteraction<CacheType>, userId: number, position: number) {
    try {
        const cardInPosition = await UserDeck.findOne({
            where: {
                userId: userId,
                slot: position
            }
        });

        if (!cardInPosition) {
            interaction.followUp(`No hay ninguna carta en la posición ${position} para ser quitada.`);
            return;
        }

        // Si hay una carta en la posición, la eliminamos
        await cardInPosition.destroy();
        interaction.followUp(`La carta en la posición ${position} ha sido quitada.`);
    } catch (error) {
        console.error('Error al quitar la carta:', error);
        interaction.followUp("Hubo un error al intentar quitar la carta.");
    }
}

export async function drawUserDeck(interaction: ChatInputCommandInteraction<CacheType>) {
    try { 
        const userCarta = await findOrCreateUser(interaction.user.id);
        const userId = userCarta[0].id;
        const userDeck = await UserDeck.findAll({
            where: { userId: userId }
        });

        const canvasWidth = 1280; // Ajusta según tu imagen base y la cantidad de cartas
        const canvasHeight = 960; // Ajusta según tu imagen base y la cantidad de cartas
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        // Carga la imagen base del deck
        const deckBase = await loadImage(path.join('resources/ranked-cards-script', 'deck_base2.png'));
        ctx.drawImage(deckBase, 0, 0, canvasWidth, canvasHeight);

        const positions = [[454, 38], [33,38], [245,38], [33,334], [245,334], [860,38], [1073,38], [860,334], [1073,334]];
        const smallSize = [177, 265];
        const bigSize = [373, 560];
        const sizes = [bigSize,smallSize,smallSize,smallSize,smallSize,smallSize,smallSize,smallSize,smallSize];
        for (let i = 0; i < userDeck.length; i++) {
            const cardId = userDeck[i].cardId;
            const result = await findCardById(cardId);
            const card = result[0];
            const generatedCard = await drawCardFromData(card);
            const cardBuffer = generatedCard[0];
            const cardImage = await loadImage(cardBuffer);
            const posX = positions[userDeck[i].slot][0];
            const posY = positions[userDeck[i].slot][1];
            const sizeX = sizes[userDeck[i].slot][0];
            const sizeY = sizes[userDeck[i].slot][1];
            ctx.drawImage(cardImage, posX, posY, sizeX, sizeY);
        }

        const topcard = await findTopCard(userId);
        if(topcard) {
            const topgeneratedCard = await drawCardFromData(topcard);
            const topcardBuffer = topgeneratedCard[0];
            const topcardImage = await loadImage(topcardBuffer);
            ctx.drawImage(topcardImage, 33, 665, smallSize[0], smallSize[1]);
        }

        const avatarURL = interaction.user.displayAvatarURL({ size: 256 });
        if (avatarURL) {
            const imageResponse = await axios.get(avatarURL, {
                responseType: 'arraybuffer',
            });
            const profileImg = await sharp(imageResponse.data).toFormat('png').toBuffer();
            const avatarImage = await loadImage(profileImg);
            ctx.drawImage(avatarImage, 972, 670, 256, 256);
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `90px Teko`;
        ctx.textAlign = 'right';
        const userDeckText = interaction.user.username + "'s Deck"
        ctx.fillText(userDeckText.toUpperCase(), 945, 718);

        const totalCards = await countUserCards(userId);
        const cardsOver13 = await countCardsByMinimumStars(userId, 13);
        const cardsOver12 = await countCardsByMinimumStars(userId, 12);
        const cardsOver11 = await countCardsByMinimumStars(userId, 11);

        const dataText0 = "Cartas en total: " + totalCards
        const dataText1 = "Cantidad de cartas sobre 13: " + cardsOver13
        const dataText2 = "Cantidad de cartas sobre 12: " + cardsOver12
        const dataText3 = "Cantidad de cartas sobre 11: " + cardsOver11;

        ctx.font = `52px Teko`;
        ctx.fillText(dataText0, 945, 760+15);
        ctx.fillText(dataText1, 945, 810+15);
        ctx.fillText(dataText2, 945, 860+15);
        ctx.fillText(dataText3, 945, 910+15);

        // Envía la imagen como respuesta
        await interaction.followUp({ 
            files: [{
                    attachment: canvas.toBuffer(),
                    name: "card.png" 
        }]});
    } catch (error) {
        console.error('Error al mostrar el user deck:', error);
        interaction.followUp("Hubo un error al intentar mostrar tus cartas.");
    }
}