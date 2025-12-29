const express = require('express');
const cors = require('cors');
const { translate } = require('@vitalets/google-translate-api');

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to detect Japanese characters
const hasJapanese = (text) => {
  return /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
};

// Helper to translate a single string if needed
const translateText = async (text) => {
  if (!text || !hasJapanese(text)) return text;
  try {
    const res = await translate(text, { to: 'en' });
    return res.text;
  } catch (err) {
    console.error("Translation error:", err);
    return text; // Return original on error
  }
};

app.post('/translate-servant', async (req, res) => {
  const servant = req.body;
  console.log(`Translating data for: ${servant.name}`);

  try {
    // 1. Translate Active Skills
    if (servant.skills) {
      for (let skill of servant.skills) {
        skill.name = await translateText(skill.name);
        skill.detail = await translateText(skill.detail);
      }
    }

    // 2. Translate Passive Skills
    if (servant.classPassive) {
      for (let skill of servant.classPassive) {
        skill.name = await translateText(skill.name);
        skill.detail = await translateText(skill.detail);
      }
    }

    // 3. Translate Append Skills
    if (servant.appendPassive) {
      for (let skill of servant.appendPassive) {
        skill.name = await translateText(skill.name);
        skill.detail = await translateText(skill.detail);
      }
    }

    // 4. Translate Traits (Optional, but nice)
    if (servant.traits) {
      for (let trait of servant.traits) {
        trait.name = await translateText(trait.name);
      }
    }

    res.json(servant);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Translation failed" });
  }
});

const PORT = process.env.PORT || 5000; // Use Cloud port OR 5000 locally
app.listen(PORT, () => {
  console.log(`Translation Server running on port ${PORT}`);
});
