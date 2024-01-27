const express = require("express");
const bodyParser = require("body-parser");
const { DisconnectReason, useMultiFileAuthState } = require("baileys");
const makeWASocket = require("baileys").default;
const axios = require("axios");
const dotenv = require("dotenv").config(); // Added const keyword

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

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

const startSock = async () => {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
    });

    sock.ev.on("connection.update", function (update, connection2) {
        let _a, _b;
        let connection = update.connection,
            lastDisconnect = update.lastDisconnect;

        if (connection == "close") {
            if (
                ((_b = (_a = lastDisconnect.error) === null) || _a === void 0
                    ? void 0
                    : _a.output) === null || _b === void 0
                    ? void 0
                    : _b.statusCode !== DisconnectReason.loggedOut
            ) {
                startSock();
            }
        } else {
            console.log("connection closed");
        }

        console.log("connection update " + update); // Corrected line
    });

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];

        app.post("/", async (req, res) => {
            const { no_wa, message } = req.query;

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
                await sock.sendMessage(`${no_wa}@s.whatsapp.net`, { text: msg });

                res
                    .status(200)
                    .json({ success: true, message: "Message sent successfully" });
            } catch (error) {
                console.error("Error sending message:", error);
                res
                    .status(500)
                    .json({ success: false, error: "Failed to send message" });
            }
        });

        console.log("Received Message", JSON.stringify(msg));
    });
};

startSock();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
