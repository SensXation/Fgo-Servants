const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

// --- HELPER: Google Translate Function ---
// This hits the free Google Translate endpoint to convert JP -> EN
async function translateText(text) {
    if (!text || text.trim() === "") return text;
    // If text is already mostly English (ASCII), skip translation to save time
    if (/^[\x00-\x7F]*$/.test(text)) return text;

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&q=${encodeURIComponent(text)}`;
        const res = await axios.get(url);
        // Google returns a weird nested array: [[["Translated Text", "Original", ...]]]
        if (res.data && res.data[0] && res.data[0][0] && res.data[0][0][0]) {
            return res.data[0].map(item => item[0]).join(""); 
        }
        return text;
    } catch (err) {
        console.error("Translation failed:", err.message);
        return text; // Fallback to original text if google fails
    }
}

// --- HELPER: Process Skills in Parallel ---
// We use Promise.all to translate all skills at the same time so it's fast
async function translateSkills(skillsList) {
    if (!skillsList) return [];
    return Promise.all(skillsList.map(async (skill) => {
        // If skill is wrapped (like in Append skills), unwrap it first
        const realSkill = skill.skill ? skill.skill : skill;
        
        // Translate the description (detail)
        const translatedDetail = await translateText(realSkill.detail);
        
        return {
            ...realSkill,
            detail: translatedDetail
        };
    }));
}

app.get('/', (req, res) => res.send("FGO Translator Backend Live"));
app.get('/api/hello', (req, res) => res.json({ message: 'Backend Connected' }));

app.get('/api/servant/:id', async (req, res) => {
    const servantId = req.params.id;
    let data = null;
    let source = "NA";

    try {
        // 1. Try NA First (Official English - Fastest & Best)
        const response = await axios.get(`https://api.atlasacademy.io/nice/NA/servant/${servantId}`);
        data = response.data;
    } catch (naError) {
        // 2. Fallback to JP (Japanese Text)
        try {
            console.log(`Servant ${servantId} not in NA, fetching JP...`);
            const jpResponse = await axios.get(`https://api.atlasacademy.io/nice/JP/servant/${servantId}?lang=en`);
            data = jpResponse.data;
            source = "JP";
        } catch (jpError) {
            return res.status(404).json({ error: "Servant not found" });
        }
    }

    if (data) {
        // 3. IF DATA IS FROM JP, RUN THE TRANSLATOR
        // We only run this for JP servants to save speed for NA ones
        if (source === "JP") {
            console.log("Translating JP content...");
            const [transSkills, transNp, transPassive, transAppend] = await Promise.all([
                translateSkills(data.skills),
                translateSkills(data.noblePhantasms), // NPs are skill-like structures
                translateSkills(data.classPassive),
                translateSkills(data.appendPassive)
            ]);
            
            // Assign translated values back
            data.skills = transSkills;
            data.noblePhantasms = transNp;
            data.classPassive = transPassive;
            data.appendPassive = transAppend;
        } else {
             // For NA, just clean the Append Skills (unwrap them)
             data.appendPassive = data.appendPassive ? data.appendPassive.map(s => s.skill || s) : [];
        }

        res.json({
            name: data.name,
            className: data.className,
            skills: data.skills,
            np: data.noblePhantasms,
            classPassive: data.classPassive,
            appendPassive: data.appendPassive
        });
    }
});

module.exports = app;