import { DiscordCommand } from "@ts/interfaces";
import { Message, SlashCommandBuilder } from "discord.js";
import { RankedCardScript } from "../RankedCardScript";
import { findOrCreateUser, updateLastDraw } from "../services/UserCardManager";
import logger from "@utils/logger";
import { generateHashCard, generateRandomCard } from "../services/RankedCardGenerator";
import { calculateCardPrice, saveCard } from "../services/RankedCardManager";

export default {
	data: new SlashCommandBuilder()
		.setName('cartas')
		.setDescription('Comandos relacionados con el generador de cartas de mapas ranked de Scoresaber')
        .addSubcommand(subcommand =>
            subcommand
                .setName('top')
                .setDescription('Muestra tu carta top')
                .addBooleanOption(option => 
                    option
                        .setName('global')
                        .setDescription('Indica si quieres ver la carta top global')
                        .setRequired(false)
                ),
        ),
    async execute(script: RankedCardScript, interaction) {
        // Asegurarse de que estamos manejando un comando
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;

        if (commandName === 'cartas') {
            if (interaction.options.getSubcommand() === 'top') {
                const isGlobal = interaction.options.getBoolean('global') || false; // Default a false si no se proporciona
                // Aquí puedes implementar la lógica específica basada en si 'global' es true o false
                if (isGlobal) {
                    // Lógica para mostrar el top global de cartas
                    await interaction.reply('Mostrando el top global de cartas...');
                } else {
                    // Lógica para mostrar el top no global/local de cartas
                    await interaction.reply('Mostrando tu carta top...');
                }
            }
            else {
                await interaction.reply('Abriendo un paquete de 4 cartas...');
            }
        }
        },
} as DiscordCommand<RankedCardScript>;

async function startLoading(message: Message, palabra: string) {
    const loadingMessage = await message.channel.send(palabra);
    const loadingPoints = ['.', '..', '...'];
    let index = 0;
    const updateLoadingMessage = () => {
        loadingMessage.edit(palabra+loadingPoints[index]);
        index = (index + 1) % loadingPoints.length;
    };
    return {intervalId: setInterval(updateLoadingMessage, 1000), loadingMessage};
}

async function stopLoading(loading: { intervalId: any; loadingMessage: any }) {
    clearInterval(loading.intervalId);
    loading.loadingMessage.delete();
}

async function openCardPack(args: string[], message: Message, ) {
    let isHash = false;

    if(args.length >=2 && args[0] != null) {
        isHash = true;
    }

    const userCarta = await findOrCreateUser(message.author.id);

    if(!isHash) {
        try {

            const lastDraw = userCarta[0].lastDraw ? userCarta[0].lastDraw : new Date(0);
            const now = new Date();
            const timeSince = now.getTime() - lastDraw.getTime();
            
            const hoursSince = timeSince / (1000 * 60 * 60);

            // Verificar si la diferencia es menor a 24 horas
            if (hoursSince < 23) {
                // Convertir a horas, minutos y segundos para mostrar
                const horas = Math.floor(hoursSince);
                const minutos = Math.floor((timeSince / (1000 * 60)) % 60);
                const segundos = Math.floor((timeSince / 1000) % 60);

                // Tiempo restante para completar 24 horas
                const totalSegundosRestantes = (23 * 60 * 60) - (horas * 60 * 60 + minutos * 60 + segundos);
                const horasRestantes = Math.floor(totalSegundosRestantes / 3600);
                const minutosRestantes = Math.floor((totalSegundosRestantes % 3600) / 60);
                const segundosRestantes = totalSegundosRestantes % 60;

                // Formatear el resultado como un string

                const tiempoRestante = (horasRestantes > 0 ? (horasRestantes + " hora" + (horasRestantes == 1 ? ", " : "s, ")) : "") + 
                                        (minutosRestantes > 0 ? (minutosRestantes + " minuto" + (minutosRestantes == 1 ? " y " : "s y ")) : "") + 
                                        segundosRestantes + " segundo" + (segundosRestantes == 1 ? "" : "s");
                
                function delay(ms: number) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                await message.channel.send("Tenés que esperar " + tiempoRestante + " antes de poder sacar cartas de nuevo");
                if(hoursSince < 1) {
                    await delay(1023);
                    await message.channel.send("Ni una hora ha pasado...");
                }
                return;
            }
            else {
                updateLastDraw(message.author.id, now);
            }
        }
        catch(error) {
            logger.error(error);
        }
    }


    const loading = await startLoading(message, "Generando");

    try {

        let imageBuffers = [];
        let cardPrices = [];
        let cardIds = [];
        
        if(isHash) {
            let generatedCard = await generateHashCard(args[0], parseInt(args[1]));
            imageBuffers.push(generatedCard[0]);
            cardPrices.push(0);
        }
        else {
            let generatedCard;
            for(var i = 0; i < 4; i++) {
                let shiny = 500*Math.random() < 1;
                generatedCard = await generateRandomCard(message.author.username, shiny);
                imageBuffers.push(generatedCard[0]);
                cardPrices.push(calculateCardPrice(generatedCard[1].stars,generatedCard[1].curated,generatedCard[1].chroma,generatedCard[1].shiny))
                const cardData = generatedCard[1];
                cardData.userCardId = userCarta[0].id;                       
                let cartId = await saveCard(cardData);
                cardIds.push(cartId);
            }
        }

        stopLoading(loading);

        // Enviar carta
        for(var i = 0; i < imageBuffers.length; i++) {
            await sendCard(message, imageBuffers[i]);
            await sendButton(message, cardIds[i], cardPrices[i]);
        }                

    } catch (error) {
        logger.error(error);
        stopLoading(loading);
        message.reply("Hubo un error al intentar generar la/s carta/s.")
    }
}

function sendCard(message: Message<boolean>, arg1: any) {
    throw new Error("Function not implemented.");
}
function sendButton(message: Message<boolean>, arg1: number, arg2: number) {
    throw new Error("Function not implemented.");
}

