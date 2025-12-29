const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

// --- HELPER: Google Translate Function ---
async function translateText(text) {
    if (!text || text.trim() === "") return text;
    if (/^[\x00-\x7F]*$/.test(text)) return text; // Skip if already English

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&q=${encodeURIComponent(text)}`;
        const res = await axios.get(url);
        if (res.data && res.data[0] && res.data[0][0]) {
            return res.data[0].map(item => item[0]).join(""); 
        }
        return text;
    } catch (err) {
        console.error("Translation failed:", err.message);
        return text;
    }
}

// --- HELPER: Clean & Translate ---
async function processSkills(skillsList) {
    if (!skillsList) return [];
    
    return Promise.all(skillsList.map(async (skill) => {
        const realSkill = skill.skill ? skill.skill : skill; // Unwrap if needed
        
        // 1. Get the text (Translate if needed)
        let detail = realSkill.detail;
        
        // (Optional: You can enable translation here if you want it for JP)
        // detail = await translateText(detail); 

        // 2. THE FIX: REMOVE PLACEHOLDERS like {{1:Value:m}}
        // We replace them with '?' so it says "Charge NP by ?%" instead of ugly code.
        if (detail) {
            detail = detail.replace(/\{\{.*?\}\}/g, '?'); 
        }

        return {
            ...realSkill,
            detail: detail
        };
    }));
}

app.get('/', (req, res) => res.send("FGO Backend Live"));
app.get('/api/hello', (req, res) => res.json({ message: 'Backend Connected' }));

app.get('/api/servant/:id', async (req, res) => {
    const servantId = req.params.id;
    let data = null;

    try {
        // Try NA First
        const response = await axios.get(`https://api.atlasacademy.io/nice/NA/servant/${servantId}`);
        data = response.data;
    } catch (naError) {
        // Fallback to JP
        try {
            const jpResponse = await axios.get(`https://api.atlasacademy.io/nice/JP/servant/${servantId}?lang=en`);
            data = jpResponse.data;
        } catch (jpError) {
            return res.status(404).json({ error: "Servant not found" });
        }
    }

    if (data) {
        // Clean all the skill lists
        const [cleanSkills, cleanNp, cleanPassive, cleanAppend] = await Promise.all([
            processSkills(data.skills),
            processSkills(data.noblePhantasms),
            processSkills(data.classPassive),
            processSkills(data.appendPassive)
        ]);

        res.json({
            name: data.name,
            className: data.className,
            skills: cleanSkills,
            np: cleanNp,
            classPassive: cleanPassive,
            appendPassive: cleanAppend
        });
    }
});

module.exports = app;