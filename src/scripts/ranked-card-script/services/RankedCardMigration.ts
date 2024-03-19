import { RankedCard } from "../models";
import { getBeatSaverInfo } from "./ApiFunctions";

// Objeto para almacenar el caché de hash a bsr
const hashBsrCache: Record<string, string> = {};

export async function updateRankedCards() {
    const rankedCards: RankedCard[] = await RankedCard.findAll();

    for (const card of rankedCards) {
        const startTime = Date.now();
        let updates: Partial<RankedCard> = {};

        if (card.coverImage) {
            const urlParts = card.coverImage.split('/');
            const pngName = urlParts[urlParts.length - 1].split('.')[0];
            updates.hash = pngName;
        }

        // Verificar si el hash ya está en el caché para evitar llamadas a la API y el delay
        if (updates.hash && hashBsrCache[updates.hash]) {
            updates.bsr = hashBsrCache[updates.hash];
            console.log(`Usando caché para hash: ${updates.hash}, bsr: ${updates.bsr}`);
        } else if (updates.hash) {
            const beatSaverData = await getBeatSaverInfo(updates.hash);
            if (beatSaverData && beatSaverData.id) {
                updates.bsr = beatSaverData.id;
                // Almacenar el nuevo par hash/bsr en el caché
                hashBsrCache[updates.hash] = updates.bsr;
                console.log("Carta " + updates.bsr + " actualizada y almacenada en caché");

                const endTime = Date.now();
                const timeTaken = endTime - startTime;
                if (timeTaken < 2000) {
                    await delay(2000 - timeTaken);
                }
            }
        }

        if (Object.keys(updates).length > 0) {
            await RankedCard.update(updates, { where: { id: card.id } });
        }
    }

    console.log('Actualización completada.');
};

async function delay(ms: number) { 
    return new Promise(resolve => setTimeout(resolve, ms));
};