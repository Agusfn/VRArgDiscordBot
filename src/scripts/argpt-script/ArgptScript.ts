import { Script } from "@core/Script";
import { DiscordClientWrapper } from "@core/DiscordClient";
import axios from "axios";
import { Events, GuildTextBasedChannel } from "discord.js";

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
          const reply = response.data.choices[0].message.content;
    
          // Añade la respuesta del bot al historial
          this.history.push({ role: "system", content: "<Santos Bot>: " + reply });
    
          // Envía la respuesta de LM Studio al canal de Discord
          await this.channel.send(reply);
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

}

