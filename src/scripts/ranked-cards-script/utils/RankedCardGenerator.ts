const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const Canvas = require('canvas');
const fs = require('fs');
const stackBlur = require('stackblur-canvas');

Canvas.registerFont('Teko.ttf', { family: 'Teko Medium', weight: 'normal', style: 'normal'});

const difficultyNames = ["","Easy","","Normal","","Hard","","Expert","","ExpertPlus"];
const difficultyNamesShort = ["","E","","N","","H","","Ex","","Ex+"];
const difficultyColors = ["","#3cb371","","#59b0f4","","#ff6347","","#bf2a42","","#8f48db"];
const tagNames = ["speed", "challenge", "tech", "balanced", "dance-style", "accuracy", "fitness","none"];
const tagNamesDisplay = ["Speed", "Challenge", "Tech", "Balanced", "Dance", "Accuracy", "Fitness","?"];
const tagsColors = ["rgb(255, 51, 51)","#ff6347","rgb(235, 0, 255)","rgb(255, 199, 0)","#3cb371","rgb(51, 218, 255)","#ffbbbb","#888888"];

export async function generateRandomCard(userName: string ) {
  let ran = Math.random();
  let val;
  if(ran < 0.75) {
    val = 0.57735*Math.sqrt(ran);
  }
  else {
    val = -1*Math.sqrt(1-ran)+1
  }
  Math.min(Math.max(val, 0), 1);
  val = 13*val; // TODO obtener el mapa con mas stars
  let scoresaberInfo = await getLeaderboard(val);
  return generateCard(scoresaberInfo, userName);
}

export async function generateHashCard(hash: string, difficulty: number) {
  let scoresaberInfo = await getLeaderboardByHash(hash, difficulty);
  return generateCard(scoresaberInfo, "admin");
}

async function generateCard(scoresaberInfo: any, userName: string) {
  let beatsaverInfo = await getBeatSaverInfo(scoresaberInfo.songHash);
  let mapData = getBeatsaverDifficultyData(beatsaverInfo, difficultyNames[scoresaberInfo.difficulty.difficulty]);
  return drawCard(scoresaberInfo.songName, scoresaberInfo.songSubName, scoresaberInfo.songAuthorName, scoresaberInfo.levelAuthorName, 
    scoresaberInfo.coverImage, scoresaberInfo.difficulty.difficulty, scoresaberInfo.stars, beatsaverInfo.curator?true:false, 
    mapData.chroma, beatsaverInfo.metadata.bpm, mapData.nps, mapData.njs, beatsaverInfo.stats.upvotes, beatsaverInfo.stats.downvotes, 
    beatsaverInfo.stats.score, beatsaverInfo.tags, scoresaberInfo.rankedDate, userName, scoresaberInfo.qualified);
}

function getBeatsaverDifficultyData(beatsaverInfo: any, difficulty: string) {
  let mapset;
  for(var i = 0; i < beatsaverInfo.versions.length; i++) {
    if(beatsaverInfo.versions[i].state == "Published") {
      mapset = beatsaverInfo.versions[i];
      break;
    }
  }
  let map;
  for(var i = 0; i < mapset.diffs.length; i++) {
    if(mapset.diffs[i].characteristic == "Standard" && mapset.diffs[i].difficulty == difficulty) {
      map = mapset.diffs[i];
      break;
    }
  }
  return map;
}


//CANVAS STUFF

async function drawCard(songName: string, songSubName: string, songAuthorName: string, levelAuthorName: string, coverImage: string, difficulty: number, stars: number, 
    curated: boolean, chroma: boolean, bpm: number, nps: number, njs: number, upvotes: number, downvotes: number, score: number, tags: [string], rankedDate: string, 
    userName: string, qualified: boolean) {
  const canvas = createCanvas(400, 600);
  const ctx = canvas.getContext('2d');

  const imagenCover = await loadImage(coverImage);

  let cornerSize = 65;
  let cornerSizeSmall = 25;

  //dibujar fondo difuminado
  ctx.drawImage(imagenCover, 0, 0, canvas.width, canvas.height);
  stackBlur.canvasRGBA(canvas, 0, 0, canvas.width, canvas.height, 50);

  //obtener colores
  let rgbSum = [0,0,0];
  for(var i = 0; i < 40; i++) {
    for(var j = 0; j < 60; j++) {
      const pixel = ctx.getImageData(i, j, 1, 1).data;
      rgbSum = [rgbSum[0] + pixel[0], rgbSum[1] + pixel[1], rgbSum[2] + pixel[2]];
    }
  }
  rgbSum = [rgbSum[0]/2400, rgbSum[1]/2400, rgbSum[2]/2400];
  let brn = 0.62;
  let textColor = [rgbSum[0] + brn*(255-rgbSum[0]), rgbSum[1] + brn*(255-rgbSum[1]), rgbSum[2] + brn*(255-rgbSum[2])];
  textColor = [Math.floor(textColor[0]), Math.floor(textColor[1]), Math.floor(textColor[2])];
  let textColorStyle = 'rgba('+textColor[0]+', '+textColor[1]+', '+textColor[2]+', 1)';

  brn = 0.9;
  let borderColor = [rgbSum[0] + brn*(255-rgbSum[0]), rgbSum[1] + brn*(255-rgbSum[1]), rgbSum[2] + brn*(255-rgbSum[2])];
  borderColor = [Math.floor(borderColor[0]), Math.floor(borderColor[1]), Math.floor(borderColor[2])];
  let borderColorStyle = 'rgba('+borderColor[0]+', '+borderColor[1]+', '+borderColor[2]+', 1)';

  //oscurecer fondo
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //dibujar franja de la izquierda
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(0, 0, cornerSize, canvas.height);

  //dibujar cuadro de abajo
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(cornerSize, 430, canvas.width, canvas.height);

  //dibujar separador de abajo
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(cornerSize + 8, 548, canvas.width - 18 - cornerSize, 3);

  ctx.fillRect(228-46, 482, 2, 46);
  ctx.fillRect(228+44, 482, 2, 46);

  //dibujar recuadro con el color de la dificultad
  ctx.shadowColor = 'black';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = difficultyColors[difficulty];
  ctx.fillRect(0, 0, cornerSize, 130);

  //dibujar el texto de la dificultad
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = `56px Teko`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(difficultyNamesShort[difficulty], 33, 110);

  //titulo y artista de la cancion
  let title = songName + " " + songSubName;
  if(title.length > 32) {
    title = title.substring(0,31).trim() + "...";
  }
  let fontSize = 70;
  ctx.font = `${fontSize}px Teko`;
  let textWidth = ctx.measureText(title).width;
  const maxTextWidth = 256;

  while (textWidth > maxTextWidth && fontSize > 11) {
    fontSize -= 0.5;
    ctx.font = `${fontSize}px Teko`;
    textWidth = ctx.measureText(title).width;
  }


  ctx.fillStyle = textColorStyle;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  const capHeightRatio = 0.5;//for Teko
  const capWidthRatio = 0.05;//for Teko
  ctx.fillText(title.toUpperCase(), 2 + 78 - fontSize*capWidthRatio, 65 + fontSize*capHeightRatio);

  ctx.font = `28px Teko`;
  ctx.fillText(songAuthorName.toUpperCase(), 78, 110);


  //dibujar las estrellas del mapa
  ctx.fillStyle = 'yellow';
  ctx.font = `26px sans-serif`;

  let starsText = ""
  for(var i = 0; i < Math.floor(stars); i++) {
    starsText = starsText + "★";
  }
  textWidth = ctx.measureText(starsText).width;
  ctx.fillText(starsText, 77, 131);
  ctx.font = `28px Teko`;
  if(stars == 0) {
    if(qualified) {
      ctx.fillStyle = "#ccffff";
      ctx.fillText("QUALIFIED", textWidth + 78, 129+7);
    }
    else {
      ctx.fillStyle = "#ffcccc";
      ctx.fillText("UNRANKED", textWidth + 78, 129+7);
    }
    
  }
  else {
    ctx.fillStyle = textColorStyle;
    ctx.fillText(stars, textWidth + 78+3, 129+7);
  }

  //dibujar el cover de la cancion
  ctx.save();

  function dibujarRectanguloRedondeado(x: number, y: number, ancho: number, alto: number, radio: number) {
    ctx.beginPath();
    ctx.moveTo(x + radio, y);
    ctx.arcTo(x + ancho, y, x + ancho, y + alto, radio);
    ctx.arcTo(x + ancho, y + alto, x, y + alto, radio);
    ctx.arcTo(x, y + alto, x, y, radio);
    ctx.arcTo(x, y, x + ancho, y, radio);
    ctx.closePath();
  }
  dibujarRectanguloRedondeado(75, 130, 265, 265, 25);
  ctx.clip();
  ctx.drawImage(imagenCover, 75, 130, 265, 265);
  ctx.restore();

  //dibujar mappers
  ctx.fillStyle = textColorStyle;
  ctx.font = `28px Teko`;
  ctx.fillText(levelAuthorName.toUpperCase(), 78, 435);

  //dibujar map data
  ctx.font = `bold 20px Arial`;
  ctx.textAlign = 'center';
  nps = Math.floor(nps*100)/100;
  ctx.fillText("BPM", 228-95, 505);
  ctx.fillText("NJS", 228, 505);
  ctx.fillText("NPS", 228+95, 505);
  ctx.font = `26px Arial`;
  ctx.fillText(bpm, 228-95, 535);
  ctx.fillText(njs, 228, 535);
  ctx.fillText(nps, 228+95, 535);
  ctx.textAlign = 'right';
  ctx.font = `21px Arial`;
  ctx.fillText(upvotes + "/" + downvotes, 380, 587);

  //dibujar año
  if(rankedDate) {
    ctx.font = `bold 22px Arial`;
    if(rankedDate.startsWith("19")) {
      rankedDate = "2018";
    }
    for(i = 0; i < 4; i++) {
      let yearNumber = rankedDate.substring(i,i+1);
      ctx.fillText(yearNumber, 18 + i*(cornerSize/4)*0.9, 615-cornerSize + i*cornerSize/4 - 15);
    }
  }

  //dibujar tags
  if(!tags) {
    tags = ["none"];
  }
  let filteredTags = [];
  for(var i = 0; i < tags.length; i++) {
    if(tagNames.includes(tags[i])) {
      filteredTags.push(tags[i]);
    }
  }
  ctx.textAlign = 'left';
  ctx.font = `20px Arial`;

  let spaceAdder = 0;

  let tagIndex = tagNames.indexOf(filteredTags[0]);
  let displayTagText = tagNamesDisplay[tagIndex];
  

  for(var i = 0; i < filteredTags.length; i++) {
    
    if(i > 0) {
      spaceAdder += ctx.measureText(displayTagText).width + 18;
    }

    //dibujar rectangulo redondeado
    tagIndex = tagNames.indexOf(filteredTags[i]);
    const color = tagsColors[tagIndex];

    ctx.save();
    ctx.fillStyle = color;
    displayTagText = tagNamesDisplay[tagNames.indexOf(filteredTags[i])];
    dibujarRectanguloRedondeado(cornerSize + 18 + spaceAdder - 4, 433+10, ctx.measureText(displayTagText).width + 8, 26, 5);
    ctx.fill();
    ctx.restore();
    
    ctx.fillStyle = 'white';
    ctx.fillText(displayTagText, cornerSize + 18 + spaceAdder, 458+10);
  }
  

  //dibujar dibujador
  ctx.fillStyle = textColorStyle;
  ctx.textAlign = 'center';
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Drawn by " + userName, -300, 400);
  ctx.rotate(Math.PI / 2);


  //dibujar la score bar
  ctx.textAlign = 'right';
  ctx.font = `21px Arial`;
  ctx.fillStyle = '#f39c12';
  ctx.fillRect(cornerSize + 10, 560, 192, 30);
  ctx.fillStyle = '#00bc8c';
  ctx.fillRect(cornerSize + 10, 560, 192*score, 30);
  ctx.fillStyle = 'white';
  score = Math.floor(score*1000)/10;
  ctx.fillText(score+"%", 190, 587);

  //agregar los badges si hay
  const chromaBadge = await loadImage("./badge_chroma.png");
  const curatorBadge = await loadImage("./badge_curated.png");

  if(curated && chroma) {
    ctx.drawImage(curatorBadge, 8, 150, 50, 50);
    ctx.drawImage(chromaBadge, 8, 215, 50, 50);
  }
  else if(curated) {
    ctx.drawImage(curatorBadge, 8, 150, 50, 50);
  }
  else if(chroma) {
    ctx.drawImage(chromaBadge, 8, 150, 50, 50);
  }

  //recortar esquinas
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';

  ctx.beginPath();
  ctx.moveTo(canvas.width - cornerSize, 0);
  ctx.lineTo(canvas.width, 0);
  ctx.lineTo(canvas.width, cornerSize);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, canvas.height - cornerSize);
  ctx.lineTo(0, canvas.height);
  ctx.lineTo(cornerSize, canvas.height);
  ctx.closePath();
  ctx.fill();

  //esquinas pequeñas
  ctx.beginPath();
  ctx.moveTo(0, cornerSizeSmall);
  ctx.lineTo(0, 0);
  ctx.lineTo(cornerSizeSmall, 0);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(canvas.width, canvas.height - cornerSizeSmall);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(canvas.width - cornerSizeSmall, canvas.height);
  ctx.closePath();
  ctx.fill();

  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  //dibujar bordes
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  ctx.strokeStyle = borderColorStyle;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cornerSizeSmall,1);
  ctx.lineTo(canvas.width-cornerSize,1);
  ctx.lineTo(canvas.width-1, cornerSize);
  ctx.lineTo(canvas.width-1, canvas.height-cornerSizeSmall);
  ctx.lineTo(canvas.width-cornerSizeSmall, canvas.height-1);
  ctx.lineTo(cornerSize, canvas.height-1);
  ctx.lineTo(1, canvas.height-cornerSize);
  ctx.lineTo(1, cornerSizeSmall);
  ctx.closePath();
  ctx.stroke();

  const buffer = canvas.toBuffer('image/png');
  return buffer;
  //fs.writeFileSync('./card.png', buffer);
  //console.log("Carta dibujada");
}


//API STUFF

async function getLeaderboard(fromStar: number) {
  let result = await getAPIData(`https://scoresaber.com/api/leaderboards?ranked=true&minStar=${fromStar}&category=3&sort=1&withMetadata=true`);
  return result.leaderboards[Math.floor(Math.random()*result.leaderboards.length)];
}

async function getLeaderboardByHash(hash: string, difficulty: number) {
  let result = await getAPIData(`https://scoresaber.com/api/leaderboard/by-hash/${hash}/info?difficulty=${difficulty}`);
  return result;
}

async function getBeatSaverInfo(hash: string) {
  return await getAPIData(`https://api.beatsaver.com/maps/hash/${hash}`);
}

async function getAPIData(url: string) {
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