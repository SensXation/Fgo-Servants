const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/', (req, res) => res.send("FGO Backend Live"));
app.get('/api/hello', (req, res) => res.json({ message: 'Backend Connected' }));

app.get('/api/servant/:id', async (req, res) => {
    const servantId = req.params.id;
    let data = null;

    try {
        // [STEP 1] Try fetching from NA Database first
        // This guarantees perfect English for everyone who exists in NA.
        const response = await axios.get(`https://api.atlasacademy.io/nice/NA/servant/${servantId}`);
        data = response.data;
    } catch (naError) {
        // [STEP 2] If NA fails (404), fetch from JP Database
        // This catches JP-only servants (like Archetype Earth, Draco, etc.)
        try {
            console.log(`Servant ${servantId} not in NA, trying JP...`);
            const jpResponse = await axios.get(`https://api.atlasacademy.io/nice/JP/servant/${servantId}?lang=en`);
            data = jpResponse.data;
        } catch (jpError) {
            return res.status(404).json({ error: "Servant not found" });
        }
    }

    if (data) {
        // [FIX] "Unwrap" Append Skills
        // Both NA and JP APIs wrap Append Skills inside a "skill" object.
        // We dig it out so your Frontend can read .name and .detail directly.
        const cleanAppends = data.appendPassive 
            ? data.appendPassive.map(slot => slot.skill ? slot.skill : slot) 
            : [];

        res.json({
            name: data.name,
            className: data.className,
            skills: data.skills,             // Active Skills
            np: data.noblePhantasms,         // NPs
            classPassive: data.classPassive, // Passive Skills
            appendPassive: cleanAppends      // Append Skills (Cleaned)
        });
    }
});

module.exports = app;