const express = require("express");
const bodyParser = require("body-parser");
const { DisconnectReason, useMultiFileAuthState } = require("baileys");
const makeWASocket = require("baileys").default;
const axios = require("axios");
dotenv = require("dotenv").config();

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

let msg = "";

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

    console.log("connection update ".update);
  });

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];

    app.post("/", async (req, res) => {
      const { no_wa, message } = req.query;

      try {
        await sock.sendMessage(`${no_wa}@s.whatsapp.net`, { text: message });

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
