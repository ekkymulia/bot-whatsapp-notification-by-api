// import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';
const { ClientOptions, Client, LocalAuth, Message } = pkg;

const logger = {
    info: console.log // Replace with your actual logger implementation
};


const initializeWhatsAppClient = () => {
    const clients = {};

    const waNumber = [process.env.CLIENT_PHONE_NUMBER]

    // waNumbers.forEach((waNumber) => {
        const clientConfig = {
            authStrategy: new LocalAuth({
                clientId: waNumber[0]
            })
        };

        const client = new Client(clientConfig);

        client.on('qr', (qr) => {
            qrcode.generate(qr, { small: true });
            logger.info(`QR received for Client ${waNumber}`);
        });

        client.on('authenticated', (session) => {
            logger.info(`Client ${waNumber} authenticated`);
        });

        client.on('ready', () => {
            logger.info(`Client ${waNumber} ready`);
        });

        client.on('message', (message) => {
            logger.info(`Client ${waNumber} received message: ${message.body}`);
            console.log(message);
            // client.sendMessage(message.from, `You said: ${message.body}`);
        });

        clients[waNumber] = client;

        client.initialize();

        console.log(clients[waNumber])

        return clients[waNumber];

    // });

};

const sm = async (client, to, message) => {
    try {
        let msg = `*${getGreeting()}*
*Pesan Otomatis Aplikasi Semapor*
*=======*
${message}
*=======*
*Ini adalah pesan otomatis,*
*harap jangan merespon*
*(Testing via API)*
`;

        await client.sendMessage(to, msg);
        logger.info(`Message sent from Client ${to} to ${to}: ${message}`);
    } catch (error) {
        console.log(error)
        // logger.error(`Error sending message from Client ${client.info.me.user} to ${to}: ${error.message}`);
    }
};

const getGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
        return "Selamat Pagi"; // Good Morning
    } else if (currentHour >= 12 && currentHour < 15) {
        return "Selamat Siang"; // Good Afternoon
    } else if (currentHour >= 15 && currentHour < 18) {
        return "Selamat Sore"; // Good Evening
    } else {
        return "Selamat Malam"; // Good Night
    }
}

export { initializeWhatsAppClient, sm };
