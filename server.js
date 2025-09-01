const express = require("express");
const fetch = require("node-fetch"); // Assure-toi que c'est bien v2
const app = express();
const PORT = process.env.PORT || 3000;

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
if (!DEEPSEEK_API_KEY) {
  console.error("❌ DEEPSEEK_API_KEY non défini !");
  process.exit(1);
}

// Route pour lister les modèles accessibles
app.get("/models", async (req, res) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      }
    });

    const data = await response.json();
    res.json(data); // Renvoie directement le JSON
  } catch (err) {
    console.error("Erreur /models :", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur en ligne sur le port ${PORT}`);
});
