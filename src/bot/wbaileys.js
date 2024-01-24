import { DisconnectReason, useMultiFileAuthState } from 'baileys';
import makeWASocket from 'baileys';

const axios = require("axios");

export const startSock = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on('connection.update', function(update, connection2) {
        let _a, _b;
        let connection = update.connection,
            lastDisconnect = update.lastDisconnect;

        if (connection == "close") {
            if (((_b = (_a = lastDisconnect.error) === null) || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode !== DisconnectReason.loggedOut) {
                startSock();
            }
        } else {
            console.log("connection closed");
        }

        console.log("connection update ", update);
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('messages.upsert', async msg => {
        // Call the function to send the specific message
        await sendCustomMessage(sock, msg.key.remoteJid);
    });
};

// Function to send a GPT message
export const sendCustomMessage = async (sock, remoteJid) => {
    await sock.sendMessage(remoteJid, {
        text: "Halo, ini bot WA ekky, gunakan !robo gpt <pesan> untuk menggunakan gpt"
    });
};
