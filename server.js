// server.js
const express = require("express");
const fetch = require("node-fetch"); // Assure-toi que node-fetch est installé
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Ta clé API OpenRouter / DeepSeek
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
if (!DEEPSEEK_API_KEY) {
    console.error("❌ DEEPSEEK_API_KEY non défini !");
    process.exit(1);
}

// Middleware pour parser JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route GET de test
app.get("/", (req, res) => {
    res.send("Serveur DeepSeek/Hermes en ligne. Utilise POST /correct");
});

// Route POST pour corriger / générer texte
app.post("/correct", async (req, res) => {
    try {
        const text = req.body.text || ""; // Ignoré ici
        console.log("Texte reçu (ignoré) :", text);

        // Appel DeepSeek / OpenRouter avec le modèle choisi
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "nousresearch/hermes-4-70b", // Modèle valide
                messages: [{ role: "user", content: "Raconte-moi l'histoire de Jésus." }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erreur HTTP :", response.status, errorText);
            return res.status(response.status).json({ error: `HTTP ${response.status} : ${errorText}` });
        }

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            const corrected = data.choices[0].message.content;
            console.log("Texte reçu de DeepSeek :", corrected);
            return res.json({ corrected });
        } else {
            console.warn("Aucune réponse de DeepSeek :", JSON.stringify(data));
            return res.json({ corrected: "⚠ Aucun texte reçu de DeepSeek." });
        }

    } catch (err) {
        console.error("⚠ Erreur lors de l'appel à DeepSeek :", err);
        res.status(500).json({ error: `Erreur lors de l'appel à DeepSeek : ${err.message}` });
    }
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur DeepSeek/Hermes en ligne sur le port ${PORT}`);
});
