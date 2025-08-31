
// server.js
const express = require('express');
const bodyParser = require('body-parser');

// ⚡ Import node-fetch compatible Node 22
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// Ta clé DeepSeek
const DEEPSEEK_API_KEY = process.env.DEESEEK_API_KEY || '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';

// Middleware JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route GET test
app.get('/', (req, res) => {
    res.send('Le serveur fonctionne ! Utilise POST /correct pour corriger le texte.');
});

// Appel DeepSeek
async function correctTextWithDeepSeek(text) {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "deepseek-chat-v3.1:free",
                messages: [{
                    role: "user",
                    content: `Corrige toutes les fautes d'orthographe et de grammaire, mets les accents correctement, même pour les petites erreurs dans ce texte : "${text}"`
                }]
            })
        });

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            return text;
        }
    } catch (err) {
        console.error('Erreur DeepSeek :', err);
        return text;
    }
}

// Route POST correction
app.post('/correct', async (req, res) => {
    try {
        const text = req.body.text;
        if (!text) return res.status(400).json({ error: 'Aucun texte fourni' });

        const corrected = await correctTextWithDeepSeek(text);
        res.json({ corrected });
    } catch (err) {
        console.error('Erreur serveur :', err);
        res.status(500).json({ error: err.message });
    }
});

// Démarrer serveur
app.listen(PORT, () => {
    console.log(`Serveur DeepSeek en ligne sur le port ${PORT}`);
});
        
