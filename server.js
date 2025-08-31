// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Récupère la clé API depuis Render (sans fallback)
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
    console.error("⚠ Attention : DEEPSEEK_API_KEY non défini !");
    process.exit(1);
}

// Middleware pour parser JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route GET de test
app.get('/', (req, res) => {
    res.send('✅ Serveur fonctionne ! Utilise POST /correct pour corriger le texte.');
});

// Fonction pour appeler DeepSeek via OpenRouter
async function correctTextWithDeepSeek(text) {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "Tu es un correcteur de texte en français. Corrige uniquement les fautes de grammaire, conjugaison et orthographe sans changer le sens." },
                    { role: "user", content: text }
                ]
            })
        });

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content.trim();
        } else {
            console.error("⚠ Réponse inattendue de DeepSeek :", data);
            return text; // retourne le texte original si rien n’est corrigé
        }
    } catch (err) {
        console.error('❌ Erreur DeepSeek :', err);
        return text;
    }
}

// Route POST pour corriger du texte
app.post('/correct', async (req, res) => {
    try {
        const text = req.body.text;
        if (!text) {
            return res.status(400).json({ error: 'Aucun texte fourni' });
        }

        const corrected = await correctTextWithDeepSeek(text);
        res.json({ corrected });
    } catch (err) {
        console.error('❌ Erreur serveur :', err);
        res.status(500).json({ error: err.message });
    }
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur DeepSeek lancé sur le port ${PORT}`);
});
