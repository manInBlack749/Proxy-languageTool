// server.js
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;

// Parse JSON et x-www-form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route GET pour tester le serveur dans le navigateur
app.get('/', (req, res) => {
    res.send('Le serveur fonctionne ! POST /correct pour corriger le texte.');
});

// Route POST pour corriger le texte
app.post('/correct', async (req, res) => {
    try {
        const text = req.body.text || '';
        if (!text) return res.status(400).json({ error: 'No text provided' });

        // Appel API LanguageTool
        const response = await fetch('https://api.languagetool.org/v2/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `language=fr&text=${encodeURIComponent(text)}`
        });

        const data = await response.json();
        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
