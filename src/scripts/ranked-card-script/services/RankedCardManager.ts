import { RankedCard } from "../models";
import sequelize from "@core/sequelize";
import { Op } from 'sequelize';
import { findOrCreateUser } from "./UserCardManager";

export async function saveCard(cardData: any) {
    try {
      await sequelize.sync();
      const card = await RankedCard.create(cardData);
      return card.id;
    } catch (error) {
      console.error('Error al guardar la carta:', error);
    }
}

export async function findTopCard(userId: number) {
    try {
      const card = await RankedCard.findOne({
        where: { userCardId: userId },
        order: [['stars', 'DESC']],
      });
  
      return card;

    } catch (error) {
      console.error('Error al buscar la carta:', error);
    }
}

export async function findAllTopCard() {
    try {
      const card = await RankedCard.findOne({
        order: [['stars', 'DESC']]
      });
  
      return card;

    } catch (error) {
      console.error('Error al buscar la carta:', error);
    }
}

export async function findLastCard(userId: string) {
    try {
      const card = await RankedCard.findOne({
        where: { userCardId: userId },
        order: [['date', 'DESC']],
      });
  
      return card;

    } catch (error) {
      console.error('Error al buscar la carta:', error);
    }
}

export async function deleteAllCards(userId: string) {
    try {
        const result = await RankedCard.destroy({
          where: { userCardId: userId },
        });
    
        if (result > 0) {
            console.log(`${result} carta(s) eliminada(s) con éxito.`);
            return true;
        } else {
            console.log('No se encontraron cartas para eliminar con el autor especificado.');
            return false;
        }
    } catch (error) {
        console.error('Error al eliminar las cartas:', error);
    }
}

export async function findCard(discordUserId: string, searchText: string) {
  try {
      // Buscar cartas que coincidan con los criterios de búsqueda
      const userCarta = await findOrCreateUser(discordUserId);
      const cards = await RankedCard.findAll({
          where: {
              userCardId: userCarta[0].id,
              [Op.or]: [
                  { songName: { [Op.like]: `%${searchText}%` } },
                  { songSubName: { [Op.like]: `%${searchText}%` } },
                  { songAuthorName: { [Op.like]: `%${searchText}%` } },
                  { levelAuthorName: { [Op.like]: `%${searchText}%` } },
              ],
          },
      });
      return cards; // Retorna un array de cartas que cumplen con la condición
  } catch (error) {
      console.error('Error al buscar las cartas:', error);
  }
}

export async function findCardById(cardId: number) {
  try {
      // Buscar cartas que coincidan con los criterios de búsqueda
      const cards = await RankedCard.findAll({
          where: {
              id: cardId
          },
      });
      return cards; // Retorna un array de cartas que cumplen con la condición
  } catch (error) {
      console.error('Error al buscar la carta:', error);
  }
}

export async function countUserCards(userId: number) {
  try {
      const count = await RankedCard.count({
          where: { userCardId: userId },
      });
      return count;
  } catch (error) {
      console.error('Error al contar las cartas:', error);
  }
}

export async function countCardsByMinimumStars(userId: number, minStars: number) {
  try {
      const count = await RankedCard.count({
          where: {
              userCardId: userId,
              stars: { [Op.gte]: minStars },
          },
      });
      return count;
  } catch (error) {
      console.error('Error al contar las cartas por estrellas mínimas:', error);
  }
}

export async function sellCard(discordUserId: string, cardId: number) {
    console.log(discordUserId + " " + cardId);
}

export function calculateCardPrice(stars: number, curated: boolean, chroma: boolean, shiny: boolean) {
    let value = 5000;
    const sp = stars/13; //TO-DO obtener el numero maximo de stars de la base de datos al iniciar la aplicacion;
    const starsWeight = sp*sp*sp*sp;
    value = value*starsWeight;
    if(curated) {
      value = value*1.5;
    }
    if(chroma) {
      value = value*1.2;
    }
    if(shiny) {
      value = value*20;
    }
    return Math.round(value);
}
  