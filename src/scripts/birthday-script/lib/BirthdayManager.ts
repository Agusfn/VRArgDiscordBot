import { PlayerBirthday } from "../model/PlayerBirthday"



export class BirthdayManager {


  private errorMessage: string


  public getErrorMsg() {
      return this.errorMessage
  }


  /**
   * Add a birthday to a user. The user must not have any currently linked birthday. Validation is performed.
   * @param discordUserId 
   * @param birthday 
   * @param isSelfUser If the discordUserId is the one making this request (for validation msg purposes)
   */
  public async addBirthDayToUser(discordUserId: string, birthday: Date, isSelfUser = true): Promise<PlayerBirthday> {

      // Check if the Discord user has already any ScoreSaber account linked to them
      const currentBirthday = await PlayerBirthday.scope({ method: ["withDiscordUserId", discordUserId] }).findOne()

      if(currentBirthday) {
          if(isSelfUser) {
              this.errorMessage = `Ya tenés un cumpleaños vinculado, no podés vincular otro!`
          } else {
              this.errorMessage = `El usuario de Discord seleccionado ya tiene un cumpleaños vinculado, no se puede vincular otro.`
          }
          return null
      }
      
      let playerBirthday: PlayerBirthday

      // Store player birthday
      playerBirthday = PlayerBirthday.build({
          discordUserId: discordUserId,
          birthday: birthday
      })

      await playerBirthday.save()

      return playerBirthday

  }



  /**
   * Remove a birthday from a user. The user must have a currently linked birthday. Validation is performed.
   * @param discordUserId 
   * @param scoreSaberId 
   * @param isSelfUser If the discordUserId is the one making this request (for validation msg purposes)
   */
  public async removeBirthDayToUser(discordUserId: string, isSelfUser = true): Promise<PlayerBirthday> {

      // check user has linked scoresaber account
      const playerBirthday = await PlayerBirthday.findOne({where: { discordUserId: discordUserId }})

      if(!playerBirthday) {
          if(isSelfUser) {
              this.errorMessage = "No tenés un cumpleaños vinculado, no podés desvincularlo!"
          } else {
              this.errorMessage = `El usuario de Discord seleccionado no tiene ningun cumpleaños vinculado, no se puede desvincular.`
          }
          return null
      }

      playerBirthday.discordUserId = null
      playerBirthday.birthday = null

      await playerBirthday.save()

      return playerBirthday
  }

  /**
   * Remove a birthday from a user. The user must have a currently linked birthday. Validation is performed.
   * @param discordUserId 
   * @param scoreSaberId 
   * @param isSelfUser If the discordUserId is the one making this request (for validation msg purposes)
   */
  public async getBirthDayFromUser(discordUserId: string, isSelfUser = true): Promise<PlayerBirthday> {

    // check user has linked scoresaber account
    const playerBirthday = await PlayerBirthday.findOne({where: { discordUserId: discordUserId }})

    if(!playerBirthday) {
        if(isSelfUser) {
            this.errorMessage = "No tenés un cumpleaños vinculado, no podés desvincularlo!"
        } else {
            this.errorMessage = `El usuario de Discord seleccionado no tiene ningun cumpleaños vinculado, no se puede desvincular.`
        }
        return null
    }

    return playerBirthday
}



}