import { Script } from "@core/Script";
import { DiscordClientWrapper } from "@core/DiscordClient";
import axios from "axios";
import { GuildTextBasedChannel } from "discord.js";

const initialPrompt = 
`Ché, sos un Argentino xd, ayudas a los pibes con sus temitas de Beat Saber y VR. 
  No necesitas ser formal, se lo mas informal posible, habla con lunfardos incluso tienes permitido usar malas palabras, boludo, ché, cuchame, xd.`;

const qaMap = new Map<string, string>([
  ["Cuales son las reglas del server?", "Podés ver las reglas en $info-reglas"],
  ["Como me asigno roles?", "Entrá al canal $roles y sigue los pasos ahí indicados."],
  ["Tengo un problema con Beat Saber", "Podés entrar en $instructivos-bs que ahí hay un monton de guias."],
  ["Puedes enviar un gif?", "Por su puesto: $chad-gif"],
  ["Puedes enviar otro gif?", "Por su puesto: $jesus-gif este y el de chad son los unicos que puedo enviar de momento."],
  ["Quien es Dereknalox?", "Es el admin del servidor y top 1 Beat Saber Argentina."],
  ["Si se escuchan ruidos raros, que es?", "Es la mayonesa."],
  ["Ahora me voy a ver una replay de Derek", "🔥"],
  ["Recomendame un mapa de Beat Saber para jugar", "C18H27NO3"],
  ["Me duele la muñeca no puedo jugar Beat Saber", "Copium"],
  ["Quien es Darturr?", "GO VS"],
  ["Quien es Darturr?", "Calla noob"],
  ["Quien es Darturr?", "Tu eres eso!"],
  ["Eres gay?", "Todos somos gay aca no? en especial vos!"],
  ["mewing", "🤫🧏🏻‍♂️"],
  ["Santos, cual es tu religion?", "Soy fiel seguidor de la Mayonesa Cristiana. Viva el Acuarius de Mayonesa."],
  ["Santos, quien es tu creador?", "Mi creador original es Agusfn pero Elecast me dio voz y vida."],
]);

const variables: { [key: string]: string } = {
  "info-reglas": "https://discord.com/channels/549296239301361684/840104271261597707",
  "roles": "https://discord.com/channels/549296239301361684/965037463414386738",
  "instructivos-bs": "https://discord.com/channels/549296239301361684/965048164430258206",
  "utilidades-bs": "https://discord.com/channels/549296239301361684/1034815919630860328",
  "chad-gif": "https://tenor.com/view/mujikcboro-seriymujik-gif-24361533",
  "jesus-gif": "https://tenor.com/view/jesus-jogando-bola-gif-20827588"
};

export class ArgptScript extends Script {

    protected scriptTitle = "Argpt Script";

    public enabled: boolean = false;
    public ip: string = "localhost";
    public port: number = 25454;

    public channel: GuildTextBasedChannel;

    public history = new Array<{role: string, content: string}>;

    public pendingResponse = false;

    public typingTimeout: any;

    private startContextSize: number;
    private maxHistorySize = 200;

    constructor(public client: DiscordClientWrapper) {
        super(client);
        this.loadPrompt();
    }

    public async sendResponse() {
        this.pendingResponse = false;
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
          this.history.push({ role: "assistant", content: reply });
    
          // Envía la respuesta de LM Studio al canal de Discord
          await this.channel.send(this.removeBotMentions(reply));
        } catch (error) {
          clearInterval(typingInterval);
          console.error('Error al obtener la respuesta de la API de LLM:', error);
          await this.channel.send('Lo siento, no pude procesar tu mensaje.');
        }
    
        // Opcional: limpiar el historial si se vuelve muy grande
        if ((this.history.length - this.startContextSize) > this.maxHistorySize) {
            this.history.splice(this.startContextSize, this.history.length - this.maxHistorySize);
        }
    }

    private removeBotMentions(text: string): string {
      // Utiliza una expresión regular para encontrar todas las coincidencias de '<Santos Bot>:' y reemplazarlas por una cadena vacía
      return text.substring(13, text.length);
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
      qaMap.forEach((answer, question) => {
        this.history.push({ role: "user", content: `<User>: ${question}` });
        this.history.push({ role: "assistant", content: `<SantosBot>: ${answer}` });
      });
      this.startContextSize = this.history.length;
    }
}

