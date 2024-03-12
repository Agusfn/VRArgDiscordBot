import { UserCard } from "../models";

export async function findOrCreateUser(userId: string) {
    try {
      const user = await UserCard.findOrCreate({
        where: { discordUserId: userId }
      });
  
      return user;

    } catch (error) {
      console.error('Error al buscar o crear el usuario:', error);
    }
}

export async function findUserCardById(userId: number) {
  try {
    const user = await UserCard.findOne({
      where: { id: userId }
    });

    return user;

  } catch (error) {
    console.error('Error al buscar o crear el usuario:', error);
  }
}

export async function updateLastDraw(discordUserId: string, newLastDrawValue: Date) {
    return UserCard.update(
      { lastDraw: newLastDrawValue }, // nuevos valores para actualizar
      { where: { discordUserId: discordUserId } } // criterio para buscar el registro a actualizar
    )
    .then(result => {
      return result;
    })
    .catch(error => {
      console.error('Error al actualizar LastDraw:', error);
      throw error;
    });
}

export async function updateMoney(discordUserId: string, newMoneyValue: number) {
    return UserCard.update(
        { money: newMoneyValue }, // nuevos valores para actualizar
        { where: { discordUserId: discordUserId } } // criterio para buscar el registro a actualizar
    )
    .then(result => {
        return result;
    })
    .catch(error => {
        console.error('Error al actualizar Money:', error);
        throw error;
    });
}