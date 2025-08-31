 // server.js (version test DeepSeek avec debug complet)
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// Clé API DeepSeek depuis Render
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
  console.error("❌ ERREUR : DEEPSEEK_API_KEY non défini !");
  process.exit(1);
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route GET test
app.get("/", (req, res) => {
  res.send("✅ Serveur test DeepSeek en ligne ! POST /correct pour tester.");
});

// Fonction pour obtenir l'histoire de Jésus depuis DeepSeek
async function getJesusStory() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat-v3.1:free",
        messages: [
          {
            role: "system",
            content: "Tu es un conteur. Raconte l'histoire de Jésus de manière claire et détaillée."
          },
          {
            role: "user",
            content: "Peu importe le texte que je t'envoie, raconte-moi l'histoire de Jésus."
          }
        ]
      })
    });

    // Vérifie si la requête a réussi
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status} : ${text}`);
    }

    const data = await response.json();

    // Affiche la réponse brute pour debug
    console.log("📝 Réponse brute DeepSeek:", JSON.stringify(data, null, 2));

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    } else {
      return "⚠ DeepSeek n'a rien renvoyé.";
    }
  } catch (err) {
    console.error("❌ Erreur DeepSeek :", err.message);
    return `⚠ Erreur lors de l'appel à DeepSeek : ${err.message}`;
  }
}

// Route POST /correct pour test
app.post("/correct", async (req, res) => {
  try {
    const story = await getJesusStory();
    // Renvoie dans le champ 'corrected' pour que l'app Android le lise
    res.json({ corrected: story });
  } catch (err) {
    console.error("❌ Erreur serveur :", err);
    res.status(500).json({ error: err.message });
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur test DeepSeek en ligne sur le port ${PORT}`);
});   
