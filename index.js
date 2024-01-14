import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Client } from 'whatsapp-web.js';
import {initializeWhatsAppClient, sm} from "./src/bot/initializer.js";
import Joi from 'joi'

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const startServer = async () => {
    const botwa = await initializeWhatsAppClient();

    if (botwa) {
        botwa.on('ready', () => {
            console.log('Client is ready!');
        });


        // Start your Express server here if needed
        const port = process.env.PORT || 3000;

        app.post('/', (req, res) => {
            try {
                const { no_wa, message } = req.body;
        
                const schema = Joi.object({
                    no_wa: Joi.string()
                        .pattern(/^(628\d{1,})$/)  // Start with 628 and allow at least one digit after it
                        .min(3)
                        .max(200),
                    message: Joi.string().max(100),
                });
        
                const validationResult = schema.validate({ no_wa, message });
        
                if (validationResult.error) {
                    return res.status(400).json({ success: false, message: 'Validation Error', error: validationResult.error.message });
                }
        
                // The rest of your code for message sending...
                sm(botwa, `${no_wa}@c.us`, message)
        
                return res.status(200).json({ success: true, message: 'Message sent successfully' });
            } catch (error) {
                return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
            }
        });


        app.listen(port, () => {
            console.log(`Server started on http://localhost:${port}`);
        });
    } else {
        console.error('Failed to initialize WhatsApp client.');
    }
};

startServer();
