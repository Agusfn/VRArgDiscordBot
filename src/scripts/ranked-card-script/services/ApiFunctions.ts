import axios from "axios";

export async function getLeaderboard(fromStar: number) {
    let result = await getAPIData(`https://scoresaber.com/api/leaderboards?ranked=true&minStar=${fromStar}&category=3&sort=1&withMetadata=true`);
    return result.leaderboards[Math.floor(Math.random()*result.leaderboards.length)];
}
  
export async function getLeaderboardByHash(hash: string, difficulty: number) {
    let result = await getAPIData(`https://scoresaber.com/api/leaderboard/by-hash/${hash}/info?difficulty=${difficulty}`);
    return result;
}

export async function getDifficultiesByHash(hash: string) {
    let result = await getAPIData(`https://scoresaber.com/api/leaderboard/get-difficulties/${hash}`);
    return result;
}

export async function getBeatSaverInfo(hash: string) {
    return await getAPIData(`https://api.beatsaver.com/maps/hash/${hash}`);
}

export async function getAPIData(url: string) {
    try {
        const response = await axios.get(url);

        if (response.data) {
        let result = response.data;

        return result;

        } else {
        console.log('No se encontraron resultados.');
        }
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}