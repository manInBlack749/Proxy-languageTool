import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

app.post("/correct", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        corrected: "",
        error: "Aucun texte fourni"
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openchat/openchat-3.5-0106",
        messages: [
          {
            role: "system",
            content: "Tu es un correcteur de texte français. Corrige uniquement l’orthographe, la grammaire et le sens si nécessaire. Si le texte est déjà correct, renvoie-le tel quel. Réponds uniquement par le texte corrigé, sans explication ni guillemets."
          },
          {
            role: "user",
            content: text
          }
        ]
      })
    });

    const raw = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        corrected: "",
        error: `Erreur API (${response.status}): ${raw}`
      });
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return res.status(500).json({
        corrected: "",
        error: "Réponse API invalide"
      });
    }

    const corrected = data.choices?.[0]?.message?.content?.trim() || "";

    res.json({
      corrected,
      error: ""
    });
  } catch (error) {
    console.error("❌ Erreur serveur :", error);
    res.status(500).json({
      corrected: "",
      error: "Erreur interne du serveur"
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
