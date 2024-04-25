import { DiscordEvent } from "@ts/interfaces";
import { Events } from "discord.js";
import { ArgptScript } from "../ArgptScript";
import axios from 'axios';

const conversationHistory = new Map<string, Array<{role: string, content: string}>>();

export default {
	name: Events.MessageCreate,
	async execute(script, message) {

		if (message.author.bot) return;

    if(!script.enabled) return;

    const channelId = message.channel.id;
    if (!conversationHistory.has(channelId)) {
      conversationHistory.set(channelId, []);
    }


    const history = conversationHistory.get(channelId);
    history.push({ role: "user", content: message.content });

    // Envía el indicador de "escribiendo" cada 5 segundos
    message.channel.sendTyping();
    const typingInterval = setInterval(() => {
      message.channel.sendTyping();
    }, 5000);

    try {
      const postData = {
        messages: history,
        temperature: 1.0,
        max_tokens: -1,
        stream: false
      };

      // Envía la solicitud a LM Studio y obtiene la respuesta
      const API_URL = 'http://'+script.ip+':'+script.port+'/v1/chat/completions';
      const response = await axios.post(API_URL, postData, {
        headers: { 'Content-Type': 'application/json' }
      });
      clearInterval(typingInterval);
      const reply = response.data.choices[0].message.content;

      // Añade la respuesta del bot al historial
      history.push({ role: "system", content: reply });

      // Envía la respuesta de LM Studio al canal de Discord
      await message.channel.send(reply);
    } catch (error) {
      clearInterval(typingInterval);
      console.error('Error al obtener la respuesta de LM Studio:', error);
      await message.channel.send('Lo siento, no pude procesar tu mensaje.');
    }

    // Opcional: limpiar el historial si se vuelve muy grande
    if (history.length > 20) { // Ajusta el tamaño máximo según sea necesario
      history.splice(0, history.length - 20); // Conserva solo los últimos 20 mensajes
    }
		
	},
} as DiscordEvent<ArgptScript, Events.MessageCreate>;
