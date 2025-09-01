 // server.js
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Récupère la clé API depuis la variable d'environnement
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
    res.send('Le serveur fonctionne ! Utilise POST /correct pour corriger le texte.');
});

// Fonction pour appeler DeepSeek/OpenRouter
async function correctTextWithDeepSeek(text) {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-oss-20b", // Modèle à utiliser
                messages: [{ role: "user", content: `Corrige le texte suivant en français : "${text}"` }]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            return { corrected: "", error: `Erreur API (${response.status}): ${errText}` };
        }

        const data = await response.json();

        // Vérifie la structure de la réponse
        if (data.choices && data.choices.length > 0) {
            return { corrected: data.choices[0].message.content };
        } else {
            return { corrected: text }; // Retourne le texte original si pas de correction
        }

    } catch (err) {
        console.error('Erreur DeepSeek :', err);
        return { corrected: text, error: `Erreur lors de l'appel à DeepSeek : ${err.message}` };
    }
}

// Route POST pour corriger le texte
app.post('/correct', async (req, res) => {
    const text = req.body.text;
    if (!text) return res.status(400).json({ corrected: "", error: "Aucun texte fourni" });

    const result = await correctTextWithDeepSeek(text);
    res.json(result);
});

// Démarre le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur DeepSeek en ligne sur le port ${PORT}`);
});     
