import { RankedCard } from "../models";
import sequelize from "@core/sequelize";
import { Op, Transaction } from 'sequelize';
import { findOrCreateUser } from "./UserCardManager";
import { getCardProbabilityWeight } from "./RankedCardGenerator";

export async function saveCard(cardData: any, transaction: Transaction) {
    try {
      await sequelize.sync();
      const card = await RankedCard.create(cardData, {transaction});
      return card.id;
    } catch (error) {
      console.error('Error al guardar la carta:', error);
      transaction.rollback();
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

export async function updateCardOwnership(transaction: any, cardIdToGive: number, newOwnerIdForGivenCard: number, cardIdToReceive: number, newOwnerIdForReceivedCard: number) {
  try {
      // Actualiza la carta dada al nuevo propietario
      await RankedCard.update({ userCardId: newOwnerIdForGivenCard }, {
          where: { id: cardIdToGive },
          transaction
      });

      // Actualiza la carta recibida al nuevo propietario
      await RankedCard.update({ userCardId: newOwnerIdForReceivedCard }, {
          where: { id: cardIdToReceive },
          transaction
      });
  } catch (error) {
      await transaction.rollback();
      throw error; // Manejo de error más robusto puede ser necesario
  }
}

export async function sellCard(discordUserId: string, cardId: number) {
    console.log(discordUserId + " " + cardId);
}

const pricePoints = [[0,0],[6,50],[7.5,80],[8,200],[9.5,300],[10,500],[10.9,600],[11,1000],[11.9,1400],[12,2500],[12.9,3200],[13,5000],[15,50000]];

export function calculateCardPrice(card: RankedCard) {
    let value = 0;
    for(var i = 0; i < pricePoints.length-1; i++) {
      if(card.stars >= pricePoints[i][0] && card.stars < pricePoints[i+1][0]) {
        const pos = card.stars - pricePoints[i][0];
        value = pricePoints[i][1] + (pos / (pricePoints[i+1][0] - pricePoints[i][0])) * (pricePoints[i+1][1] - pricePoints[i][1]);
        break;
      }
    }
    value = 50 + value;
    if(card.curated) {
      value = value*1.5;
    }
    if(card.chroma) {
      value = value*1.2;
    }
    if(card.shiny) {
      value = value*20;
    }
    return Math.round(value);
}
  