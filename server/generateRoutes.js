const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

router.post("/history", async (req, res) => {
  try {
    const { title, description, tags, culturalNote } = req.body;

    // ---------------- GEMINI PROMPT ----------------
    const prompt = `
Write a warm, short (120–180 words) cultural history about this dish.

Dish title: ${title}
Description: ${description}
Tags: ${tags}
Cultural note: ${culturalNote}

Keep it friendly, respectful, and culturally aware.
`;

    // ---------------- CALL GEMINI ----------------
    const geminiResp = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const generatedText =
      geminiResp.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!generatedText)
      return res.status(500).json({ error: "Gemini returned no text" });

    // ---------------- CALL ELEVEN LABS ----------------
    const audioResp = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB",
      { text: generatedText },
      {
        responseType: "arraybuffer",
        headers: {
          "xi-api-key": process.env.ELEVEN_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    // Save audio file
    const audioFolder = path.join(__dirname, "uploads");
    if (!fs.existsSync(audioFolder)) fs.mkdirSync(audioFolder);

    const fileName = `dish_${Date.now()}.mp3`;
    const filePath = path.join(audioFolder, fileName);

    fs.writeFileSync(filePath, audioResp.data);

    const audioUrl = `/uploads/${fileName}`;

    return res.json({
      text: generatedText,
      audioUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Generation failed" });
  }
});

module.exports = router;
