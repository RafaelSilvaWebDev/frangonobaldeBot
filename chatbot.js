// Importações necessárias
const express = require('express');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { Client, MessageMedia } = require('whatsapp-web.js');

const app = express();
const client = new Client();

// Serviço de QR Code
client.on('qr', async qr => {
    try {
        const qrCodeData = await qrcode.toDataURL(qr);
        fs.writeFileSync(path.join(__dirname, 'public', 'qrcode.png'), qrCodeData.split(',')[1], { encoding: 'base64' });
    } catch (err) {
        console.error('Erro ao salvar QR Code:', err);
    }
});

// Evento de prontidão
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

// Configuração da API para servir o QR Code
app.get('/api/qrcode', (req, res) => {
    try {
        const qrCodePath = path.join(__dirname, 'public', 'qrcode.png');
        if (fs.existsSync(qrCodePath)) {
            const qrCode = fs.readFileSync(qrCodePath, { encoding: 'base64' });
            res.json({ qrCode });
        } else {
            res.status(404).send('QR Code não encontrado');
        }
    } catch (err) {
        res.status(500).send('Erro ao buscar QR Code');
    }
});

// Configuração da pasta pública
app.use(express.static(path.join(__dirname, 'public')));

// Evento para lidar com mensagens recebidas
client.on('message', async msg => {
    const currentHour = new Date().getHours(); // Obtém a hora atual (0-23)

    // Verifica se o horário está fora do intervalo permitido
    if (currentHour < 19 || currentHour >= 23) {
        await client.sendMessage(msg.from, 'Nosso estabelecimento está fechado no momento. O horário de atendimento é das 19:00 às 23:00, de Terça à Domingo, Até logo!');
        return;
    }

    if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola|opa|Opa|eai|Eai)/i) && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(3000); // Delay de 3 segundos
        await chat.sendStateTyping(); // Simulando digitação
        await delay(3000); // Delay de 3 segundos
        const contact = await msg.getContact(); // Pegando o contato
        const name = contact.pushname; // Pegando o nome do contato
        await client.sendMessage(msg.from, `Olá! ${name.split(" ")[0]}, sou o assistente virtual do Frango no Balde.🤖 Como posso ajudá-lo hoje? Por favor, digite uma das opções abaixo:\n\n1️⃣ - Cardápio\n2️⃣ - Fazer um pedido\n3️⃣ - Informações`);
    }

    if (msg.body !== null && msg.body === '1' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(3000); // Delay de 3 segundos
        await chat.sendStateTyping(); // Simulando digitação
        await delay(3000);
        const media = MessageMedia.fromFilePath('./img/menu.png');
        await client.sendMessage(msg.from, 'Segue o nosso cardápio!');
        await delay(1000); // Delay de 1 segundo
        await client.sendMessage(msg.from, media);
        await delay(3000); // Delay de 3 segundos
        await client.sendMessage(msg.from, '🍗😄 Estou aqui para anotar seu pedido crocante. O que vai ser hoje?');
    }

    if (msg.body !== null && msg.body === '2' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(3000); // Delay de 3 segundos
        await chat.sendStateTyping(); // Simulando digitação
        await delay(3000);
        await client.sendMessage(msg.from, '🍗😄 Estou aqui para anotar seu pedido crocante. O que vai ser hoje?');
    }

    if (msg.body !== null && msg.body === '3' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(3000); // Delay de 3 segundos
        await chat.sendStateTyping(); // Simulando digitação
        await delay(3000);
        await client.sendMessage(msg.from, '🤔 Tem alguma dúvida sobre o nosso Frango no Balde? Manda pra gente, estamos aqui para ajudar!');
    }
});

// Função de delay
const delay = ms => new Promise(res => setTimeout(res, ms));

// Inicializar cliente do WhatsApp
client.initialize();

// Iniciar servidor Express
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
