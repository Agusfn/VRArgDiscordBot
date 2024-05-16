import { Script } from "@core/Script";
import { DiscordClientWrapper } from "@core/DiscordClient";
import axios from "axios";
import { parse } from 'node-html-parser';
import { GuildTextBasedChannel } from "discord.js";
import { AudioPlayerStatus, StreamType, createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";

const googleTTS = require('google-tts-api');

const initialPrompt = 
`Ché, sos un Argentino xd, ayudas a los pibes con sus temitas de Beat Saber y VR. 
  No necesitas ser formal, se lo mas informal posible, tienes permitido usar malas palabras, boludo, ché, cuchame, xd.
  Puedes mandar memes y gif con $descripcion-gif y $descripcion-meme por ejemplo $beat-saber-gif o $vr-chat-meme`;

const qaMap = new Map<string, string>([
  ["Cuales son las reglas del server?", "Podés ver las reglas en $info-reglas"],
  ["Como me asigno roles?", "Entrá al canal $roles y sigue los pasos ahí indicados."],
  ["Tengo un problema con Beat Saber", "Podés entrar en $instructivos-bs que ahí hay un monton de guias."],
  ["Puedes enviar un gif de chad?", "Por su puesto: $chad-gif"],
  ["Puedes enviar otro gif de jesus jogando bola?", "Por su puesto: $jesus-jogando-bola-gif"],
  ["Quien es Dereknalox?", "Es el admin del servidor y top 1 Beat Saber Argentina. $beat-saber-gif"],
  ["Si se escuchan ruidos raros, que es?", "Es la mayonesa. $mayonesa-meme"],
  ["Manda un meme de VR Chat", "$vr-chat-meme"],
  ["Ahora me voy a ver una replay de Derek", "🔥"],
  ["Recomendame un mapa de Beat Saber para jugar", "C18H27NO3 $beat-saber-gif"],
  ["Me duele la muñeca no puedo jugar Beat Saber", "Copium $copium-gif"],
  ["Quien es Darturr?", "GO VS"],
  ["Dime quien es Darturr?", "Calla noob"],
  ["Que sabes de Darturr?", "Tu eres eso!"],
  ["Eres gay?", "Todos somos gay aca no? en especial vos! $you-are-gay-gif"],
  ["mewing", "🤫🧏🏻‍♂️ $mewing-gif"],
  ["Santos, cual es tu religion?", "Soy fiel seguidor de la Mayonesa Cristiana. Viva el Acuarius de Mayonesa."],
  ["Santos, quien es tu creador?", "Mi creador original es Agusfn pero Elecast me dio voz y vida."],
  ["Manda un meme de Beat Saber", "$beat-saber-meme"],
  ["Manda un meme de Argentina", "Aqui tienes: $argentina-meme"],
  ["Envia otro meme de Beat Saber", "Claro che! $beat-saber-meme"],
  ["Quienes son los miembros de la Trompis Gang?", "Andres, Burrito, Feco, Manolo y Megu $la-nueva-trompis-gif"],
  ["Lista los apodos de Dereknalox123", "dedoenelanox, derekcagox, nayomematox, durex, derekkcacox, mayonesalox."],
  ["Si te escribe <Uadyet> respondele No", "Por supuesto si me escribe Uadyet le responderé con un No $no-gif"],
]);

const variables: { [key: string]: string } = {
  "info-reglas": "https://discord.com/channels/549296239301361684/840104271261597707",
  "roles": "https://discord.com/channels/549296239301361684/965037463414386738",
  "instructivos-bs": "https://discord.com/channels/549296239301361684/965048164430258206",
  "utilidades-bs": "https://discord.com/channels/549296239301361684/1034815919630860328",
  "chad-gif": "https://tenor.com/view/mujikcboro-seriymujik-gif-24361533",
  "jesus-jogando-bola-gif": "https://tenor.com/view/jesus-jogando-bola-gif-20827588"
};

const lastTwo = ["",""];

export class ArgptScript extends Script {

    protected scriptTitle = "Argpt Script";

    public enabled: boolean = false;
    public ip: string = "localhost";
    public port: number = 25454;

    public channel: GuildTextBasedChannel;

    public history = new Array<{role: string, content: string}>;

    public pendingResponse = false;

    public typingTimeout: any;

    public voiceEnabled: boolean = false;
    public voiceChannel: any;
    public voiceLang: string = 'es';

    private startContextSize: number;
    private maxHistorySize = 200;

    private timeoutHandle: NodeJS.Timeout | null = null;

    constructor(public client: DiscordClientWrapper) {
        super(client);
        this.loadPrompt();
    }

    public async sendResponse() {
        // Envía el indicador de "escribiendo" cada 5 segundos
        this.channel.sendTyping();
        const typingInterval = setInterval(() => {
            this.channel.sendTyping();
        }, 5000);
    
        try {
          const postData = {
            messages: this.history,
            temperature: 0.8,
            max_tokens: -1,
            stream: false
          };
    
          // Envía la solicitud a LM Studio y obtiene la respuesta
          const API_URL = 'http://'+this.ip+':'+this.port+'/v1/chat/completions';
          const response = await axios.post(API_URL, postData, {
            headers: { 'Content-Type': 'application/json' }
          });
          clearInterval(typingInterval);
          let reply = this.replaceVariables(response.data.choices[0].message.content);
          
          // Añade la respuesta del bot al historial
          if(reply.length == 0) {reply = "<SantosBot>: :wheelchair:"}
          if(!reply.substring(1, reply.length).startsWith("SantosBot")) {
            reply = "<SantosBot>: " + reply;
          }
          
          const similar = compareStringsIgnoreCase(lastTwo[1], lastTwo[0], 13);//TODO 13 es el largo por SantosBot pero deberia ser dinamico
          if(similar > 6) {
            const similar2 = compareStringsIgnoreCase(lastTwo[0], reply, 13);
            if(similar2 > 0) {
              reply = "<SantosBot>: " + reply.substring(13 + similar2, reply.length);
            }
          }

          if(reply == "<SantosBot>: " || reply == "<SantosBot>:") {
            reply = reply + " xd";
          }
          console.log("sending: " + reply);
          this.history.push({ role: "assistant", content: reply });

          lastTwo[1] = lastTwo[0];
          lastTwo[0] = reply;

          reply = await reemplazarPlaceholders(reply);
          // Envía la respuesta de LM Studio al canal de Discord
          let finalMessage = this.removeBotMentions(reply);
          if(finalMessage.length == 0) {
            finalMessage = finalMessage + " xd";
          }
          await this.channel.send(finalMessage);

          this.pendingResponse = false;
          if(this.voiceEnabled) {
            await this.handleVoice(finalMessage.replace(/https?:\/\/\S+\b/g, ''));
          }
        } catch (error) {
          clearInterval(typingInterval);
          this.pendingResponse = false;
          console.error('Error al obtener la respuesta de la API de LLM:', error);
          await this.channel.send('Lo siento, no pude procesar tu mensaje.');
        }
    
        // Opcional: limpiar el historial si se vuelve muy grande
        if ((this.history.length - this.startContextSize) > this.maxHistorySize) {
            this.history.splice(this.startContextSize, this.history.length - this.maxHistorySize);
        }
    }

    private removeBotMentions(text: string): string {
      if(text.length <= 13) {
        return text;
      }
      text = text.substring(13, text.length).trim();
      if(!text.includes(':')) {
        return text;
      }
      if(text.startsWith('<')) {
        var pos = text.indexOf('>');
        if(pos) {
          text = text.substring(pos+2, text.length).trim();
        }
      }
      return text;
    }

    private replaceVariables(text: string): string {
      Object.keys(variables).forEach(key => {
          text = text.replace(new RegExp("\\$"+key, 'g'), variables[key]);
      });
      text = text.replace(/@([^\s\n]+)/g, '$1');
      return text;
    }
    
    public loadPrompt() {
      this.history.push({ role: "system", content: initialPrompt});
      this.history.push({ role: "assistant", content: "<SantosBot>: Que onda pibes en que puedo ayudarlos? xd" });
      this.history.push({ role: "assistant", content: "<SantosBot>: O quieren hacer algo? cuentenme" });
      const userNames = ["Elecast","Agusfn","Dereknalox123","Andres","Izaknifey","Darturr","Megu","Manoloreturns","Feco","Salva"];
      qaMap.forEach((answer, question) => {
        this.history.push({ role: "user", content: "<" + userNames[Math.floor(Math.random()*userNames.length)] + ">: " + question });
        this.history.push({ role: "assistant", content: `<SantosBot>: ${answer}` });
      });
      this.history.push({ role: "user", content: "<Uadyet>: Santos, manda un gif de Bocchi"});
      this.history.push({ role: "assistant", content: `<SantosBot>: No` });
      this.startContextSize = this.history.length;
    }

    public async handleVoice(text: string) {
      // Asegurar que interaction.member es una instancia de GuildMember

      this.resetTimer();
      
      const urls = await getSpeechFromText(text, this.voiceLang);
    
      const connection = joinVoiceChannel({
          channelId: this.voiceChannel.id,
          guildId: this.voiceChannel.guild.id,
          adapterCreator: this.voiceChannel.guild.voiceAdapterCreator,
      });
    
      const player = createAudioPlayer();
      connection.subscribe(player);
  
      let current = 0;
  
      player.on('stateChange', (oldState, newState) => {
          if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
              current++;
              if (current < urls.length) {
                  const resource = createAudioResource(urls[current].url, {
                      inputType: StreamType.Arbitrary,
                  });
                  player.play(resource);
              } else {
                this.setupDisconnectTimer(connection);
              }
          }
      });
  
      // Empezar reproducción con la primera URL
      const resource = createAudioResource(urls[current].url, {
          inputType: StreamType.Arbitrary,
      });
      player.play(resource);
    }

    private setupDisconnectTimer(connection: any) {
      // Clear existing timer if any
      if (this.timeoutHandle) {
          clearTimeout(this.timeoutHandle);
      }

      // Set a new timer
      this.timeoutHandle = setTimeout(() => {
          connection.disconnect();
          connection.destroy();
          this.timeoutHandle = null; // Reset the timer handle
      }, 60000); // Wait for 60 seconds before disconnecting
  }

    public resetTimer() {
        // Method to reset timer when new message is received
        if (this.timeoutHandle) {
            clearTimeout(this.timeoutHandle);
            this.timeoutHandle = null;
        }
    }
}

async function buscarGif(query: string): Promise<string> {
  const baseUrl = 'https://tenor.com/search/';
  const url = `${baseUrl}${encodeURIComponent(query)}-gifs`;

  try {
    const response = await axios.get(url);
    const html = response.data;
    const root = parse(html);
    
    // Encuentra la sección con la clase "GifList"
    const gifList = root.querySelector('.GifList');

    if (!gifList) {
        throw new Error('No se encontró la sección "GifList"');
    }
    
    // Buscamos todos los enlaces de GIF en la sección "GifList"
    const gifLinks = gifList.querySelectorAll('a[href*="/view/"]').map(el => `https://tenor.com${el.getAttribute('href')}`);
    
    if (gifLinks.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(gifLinks.length, 10));
        return gifLinks[randomIndex];
    } else {
        throw new Error('No se encontró ningún GIF en la sección especificada');
    }
  } catch (error) {
      return ` `;
  }
}

async function buscarMeme(query: string): Promise<string> {
  const baseUrl = 'https://tenor.com/search/';
  const url = `${baseUrl}${encodeURIComponent(query)}-gifs`;

  try {
    const response = await axios.get(url);
    const html = response.data;
    const root = parse(html);
    const gifLinks = root.querySelectorAll('a[href*="/view/"]').map(el => `https://tenor.com${el.getAttribute('href')}`);

    if (gifLinks.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(gifLinks.length, 10));
        return gifLinks[randomIndex];
    } else {
        throw new Error('No se encontró ningún Meme');
    }
  } catch (error) {
      return ` `;
  }
}

async function reemplazarPlaceholders(texto: string): Promise<string> {
  var words = texto.split(' ');
  for(var i = 0; i < words.length; i++) {
    var word = words[i];
    if(word.startsWith("$") && word.includes("gif")) {
      var searchText = word.substring(1,word.length-4).replace(/-/g, ' ');
      const gifUrl = await buscarGif(searchText);
      texto = texto.replace(word, gifUrl);
    }
    else if(word.startsWith("$") && word.includes("meme")) {
      var searchText = word.substring(1,word.length-5).replace(/-/g, ' ');
      const memeUrl = await buscarMeme(searchText);
      texto = texto.replace(word, memeUrl);
    }
    else if(word.startsWith("$")) {
      var searchText = word.substring(1,word.length).replace(/-/g, ' ');
      const gifUrl = await buscarGif(searchText);
      texto = texto.replace(word, gifUrl);
    }
  }
  return texto;
}

async function getSpeechFromText(text: string, lang: string = 'es') {
  try {
      const urls = await googleTTS.getAllAudioUrls(text, {
          lang: lang,
          slow: false,
          host: 'https://translate.google.com',
      });

      return urls;

  } catch (error) {
      console.error('Error al generar el audio TTS:', error);
  }
};

function compareStringsIgnoreCase(str1: string, str2: string, offset: number): number {
  // Validar si alguna de las cadenas es vacía
  if (str1.length <= offset || str2.length <= offset) {
      return 0;
  }

  // Convertir ambas cadenas a minúsculas
  const lowerStr1 = str1.toLowerCase().substring(offset, str1.length);
  const lowerStr2 = str2.toLowerCase().substring(offset, str2.length);

  let index = 0;
  const minLength = Math.min(lowerStr1.length, lowerStr2.length);

  while (index < minLength && lowerStr1[index] === lowerStr2[index]) {
      index++;
  }

  return index;
}