// server.js
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// Récupère ta clé API depuis Render (Dashboard -> Environment)
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
  console.error("❌ ERREUR : DEEPSEEK_API_KEY n'est pas défini !");
  process.exit(1);
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route test
app.get("/", (req, res) => {
  res.send("✅ Serveur en ligne ! Utilise POST /correct pour corriger du texte.");
});

// Fonction correction via DeepSeek
async function correctTextWithDeepSeek(text) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat-v3.1:free",
        messages: [
          {
            role: "system",
            content:
              "Tu es un correcteur automatique de texte en français. Corrige toutes les fautes de grammaire, orthographe et conjugaison, sans changer le sens du texte. Même si le texte est correct, renvoie-le.",
          },
          { role: "user", content: text },
        ],
      }),
    });

    const data = await response.json();

    // Debug : affiche toute la réponse de DeepSeek
    console.log("📝 Réponse brute DeepSeek:", JSON.stringify(data, null, 2));

    // Vérifie si DeepSeek a renvoyé quelque chose
    if (data.choices && data.choices.length > 0) {
      // Selon le format exact, ça peut être `message.content`
      const result =
        data.choices[0].message?.content ||
        data.choices[0].messages?.[0]?.content ||
        text;

      return result.trim();
    } else {
      return text;
    }
  } catch (err) {
    console.error("❌ Erreur DeepSeek :", err);
    return text;
  }
}

// Route correction
app.post("/correct", async (req, res) => {
  try {
    const text = req.body.text;
    if (!text) return res.status(400).json({ error: "Aucun texte fourni" });

    const corrected = await correctTextWithDeepSeek(text);
    res.json({ corrected });
  } catch (err) {
    console.error("❌ Erreur serveur :", err);
    res.status(500).json({ error: err.message });
  }
});

// Lancement serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur DeepSeek en ligne sur le port ${PORT}`);
});
