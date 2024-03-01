export interface RankedCardI {
  id: number,
  userCardId: number,
  date: Date,
  songName: string, 
  songSubName: string, 
  songAuthorName: string, 
  levelAuthorName: string, 
  coverImage: string, 
  difficulty: number, 
  stars: number, 
  curated: boolean, 
  chroma: boolean, 
  bpm: number, 
  nps: number, 
  njs: number, 
  upvotes: number, 
  downvotes: number, 
  score: number, 
  tags: [string], 
  rankedDate: string, 
  userName: string, 
  qualified: boolean,
  shiny: boolean
}

export interface UserCardI {
  id: number,
  discordUserId: string,
  lastDraw: Date,
  money: number
}