// import { PlayerBirthday } from "../models/PlayerBirthday";

export class PlayerBirthdayManager {

  private errorMessage: string

  public getErrorMsg() {
      return this.errorMessage
  }

  async registerBirthday(interactionUserId: string, fechaNacimiento: Date) {
    // let playerBirthday: PlayerBirthday

    // // Check if the Discord user has already any birthday registered
    // const currentBirthday = PlayerBirthday.scope({ method: ["withDiscordUserId", interactionUserId] }).findOne()

    // if(currentBirthday) {
    //     this.errorMessage = `Ya tenés tu cumpleaños registrado!`
    //     return null
    // }

    // // Register new birthday
    // playerBirthday = new PlayerBirthday()
    // playerBirthday.birthday = fechaNacimiento
    // playerBirthday.discordUserId = interactionUserId
    // await playerBirthday.save()

    // return playerBirthday

    return "test"

  }

  async unregisterBirthday(interactionUserId: string) {
    // let playerBirthday: PlayerBirthday

    // // Check if the Discord user has already any birthday registered
    // const currentBirthday = PlayerBirthday.scope({ method: ["withDiscordUserId", interactionUserId] }).findOne()

    // if(!currentBirthday) {
    //     this.errorMessage = `No tenés tu cumpleaños registrado!`
    //     return null
    // }

    // // Unregister birthday
    // playerBirthday = new PlayerBirthday()
    // playerBirthday.birthday = new Date()
    // playerBirthday.discordUserId = interactionUserId
    // await playerBirthday.save()

    // return playerBirthday

    return "test"

  }

  async getBirthday(interactionUserId: string) {
    // Check if the Discord user has already any birthday registered
    // const currentBirthday =  await PlayerBirthday.scope({ method: ["withDiscordUserId", interactionUserId] }).findOne()

    // if(!currentBirthday) {
    //     this.errorMessage = `No tenés tu cumpleaños registrado!`
    //     return null
    // }

    // return currentBirthday.birthday

    return new Date()

  }

}