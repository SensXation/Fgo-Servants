const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

// Translate function
async function translateText(text) {
    if (!text || text.trim() === "") return text;
    // If text is already mostly English, skip translation to save speed
    if (/^[\x00-\x7F]*$/.test(text)) return text;

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&q=${encodeURIComponent(text)}`;
        const res = await axios.get(url);
        // Google returns data in a nested array: [[["Translated Text", "Original", ...]]]
        if (res.data && res.data[0]) {
            return res.data[0].map(item => item[0]).join(""); 
        }
        return text;
    } catch (err) {
        console.error("Translation failed:", err.message);
        return text;
    }
}

//  Clean & Translate  the Skills
async function processSkills(skillsList, shouldTranslate) {
    if (!skillsList) return [];
    
    return Promise.all(skillsList.map(async (skill) => {
        // Unwrap Append Skills if they are wrapped in a "skill" object
        const realSkill = skill.skill ? skill.skill : skill; 
        
        let detail = realSkill.detail;
        let name = realSkill.name;

        // 1. CLEAN: Remove the ugly {{...}} variables FIRST
        // replace them with '?' (e.g., "Charge NP by ?%")
        if (detail) {
            detail = detail.replace(/\{\{.*?\}\}/g, '?'); 
        }
        
        // 2. TRANSLATE: Only if the servant came from JP
        if (shouldTranslate && detail) {
            detail = await translateText(detail);
        }

        if (name) {
                name = await translateText(name);
            }

        return {
            ...realSkill,
            name: name,
            detail: detail
        };
    }));
}

app.get('/', (req, res) => res.send("FGO Backend Live"));
app.get('/api/hello', (req, res) => res.json({ message: 'Backend Connected' }));

app.get('/api/servant/:id', async (req, res) => {
    const servantId = req.params.id;
    let data = null;
    let isJpSource = false;

    try {
        // Step A: Try NA (Official English)
        const response = await axios.get(`https://api.atlasacademy.io/nice/NA/servant/${servantId}`);
        data = response.data;
    } catch (naError) {
        // Step B: Fallback to JP (Japanese)
        try {
            console.log(`Servant ${servantId} not in NA. Fetching JP...`);
            const jpResponse = await axios.get(`https://api.atlasacademy.io/nice/JP/servant/${servantId}?lang=en`);
            data = jpResponse.data;
            isJpSource = true; // Mark as JP so translate it later
        } catch (jpError) {
            return res.status(404).json({ error: "Servant not found" });
        }
    }

    if (data) {
        // Process all skills (Active, NP, Passive, Append)
        // Pass the 'isJpSource' to tell the helper whether to run Google Translate
        const [cleanSkills, cleanNp, cleanPassive, cleanAppend] = await Promise.all([
            processSkills(data.skills, isJpSource),
            processSkills(data.noblePhantasms, isJpSource),
            processSkills(data.classPassive, isJpSource),
            processSkills(data.appendPassive, isJpSource)
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