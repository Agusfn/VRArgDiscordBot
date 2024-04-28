import { Script } from "@core/Script";
import { DiscordClientWrapper } from "@core/DiscordClient";
import axios from "axios";
import { GuildTextBasedChannel } from "discord.js";

const initialPrompt = `
  Ché, sos un Argentino xd, ayudas a los pibes con sus temitas de Beat Saber y VR. 
  No necesitas ser formal, se lo mas informal posible, habla con lunfardos incluso tienes permitido usar malas palabras, boludo, ché, cuchame, xd.
  - Si preguntan por reglas responde con: $info-reglas
  - Si preguntan por roles, responde con: $roles
  - Si necesitan ayuda con Beat Saber, responde con: $instructivos-bs
  - Si necesitan mods argentinos de Beat Saber, responde con: $utilidades-bs
  - Si alguien manda algo basado, responde con: $chad-gif
`;

const variables: { [key: string]: string } = {
  "info-reglas": "https://discord.com/channels/549296239301361684/840104271261597707",
  "roles": "https://discord.com/channels/549296239301361684/965037463414386738",
  "instructivos-bs": "https://discord.com/channels/549296239301361684/965048164430258206",
  "utilidades-bs": "https://discord.com/channels/549296239301361684/1034815919630860328",
  "chad-gif": "https://tenor.com/view/mujikcboro-seriymujik-gif-24361533"
};

export class ArgptScript extends Script {

    protected scriptTitle = "Argpt Script";

    public enabled: boolean = false;
    public ip: string = "localhost";
    public port: number = 1234;

    public channel: GuildTextBasedChannel;

    public history = new Array<{role: string, content: string}>;

    public pendingResponse = false;

    public typingTimeout: any;

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
          const reply = this.replaceVariables(response.data.choices[0].message.content);
    
          // Añade la respuesta del bot al historial
          this.history.push({ role: "assistant", content: reply });
    
          // Envía la respuesta de LM Studio al canal de Discord
          await this.channel.send(this.removeBotMentions(reply));
        } catch (error) {
          clearInterval(typingInterval);
          console.error('Error al obtener la respuesta de LM Studio:', error);
          await this.channel.send('Lo siento, no pude procesar tu mensaje.');
        }
    
        // Opcional: limpiar el historial si se vuelve muy grande
        if (this.history.length > 30) { // Ajusta el tamaño máximo según sea necesario
            this.history.splice(0, this.history.length - 30); // Conserva solo los últimos 20 mensajes
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
      return text;
    }
    
    public loadPrompt() {
      this.history.push({ role: "system", content: initialPrompt});
      this.history.push({ role: "assistant", content: "<SantosBot>: Que onda pibes en que puedo ayudarlos? xd" });
      this.history.push({ role: "assistant", content: "<SantosBot>: O quieren hacer algo? cuentenme" });
    }
}

