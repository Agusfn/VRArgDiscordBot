import { RankedCard } from "../models";
import sequelize from "@core/sequelize";

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
  