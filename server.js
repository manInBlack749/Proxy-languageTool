// server.js
const express = require('express');
const bodyParser = require('body-parser');

// Import compatible Node 22
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;
console.log("==== DEBUG ENV ====");
console.log("process.env.DEEPSEEK_API_KEY:", process.env.DEEPSEEK_API_KEY);
console.log("===================");

// ⚠ Clé API DeepSeek / OpenRouter depuis variable d'environnement
const DEEPSEEK_API_KEY = process.env.DEESEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
    console.error("⚠ Attention : DEEPSEEK_API_KEY non défini !");
    process.exit(1); // Stoppe le serveur si pas de clé
}

// Middleware JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route GET test
app.get('/', (req, res) => {
    res.send('Serveur DeepSeek actif ! POST /correct pour corriger le texte.');
});

// Fonction pour corriger le texte via DeepSeek
async function correctTextWithDeepSeek(text) {
    try {
        console.log("Envoi au serveur DeepSeek :", text);

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
                    content: `Corrige absolument toutes les fautes d'orthographe, de grammaire et de sens, mets les accents correctement, même les petites erreurs dans ce texte : "${text}"`
                }]
            })
        });

        const data = await response.json();
        console.log("Réponse DeepSeek brute :", data);

        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            return text; // Retourne le texte original si DeepSeek ne renvoie rien
        }

    } catch (err) {
        console.error('Erreur DeepSeek :', err);
        return text;
    }
}

// Route POST pour corriger le texte
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
