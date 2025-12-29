const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/', (req, res) => res.send("FGO Backend Live"));
app.get('/api/hello', (req, res) => res.json({ message: 'Backend Connected' }));

app.get('/api/servant/:id', async (req, res) => {
    const servantId = req.params.id;
    try {
        // [FIX 1] Use JP Region + Force English Language
        // This ensures even new JP servants (like Hakuno) get English text where available
        const response = await axios.get(`https://api.atlasacademy.io/nice/JP/servant/${servantId}?lang=en`);
        const data = response.data;

        if (data) {
            // [FIX 2] "Unwrap" the Append Skills
            // The API sends Append Skills wrapped in a "skill" object.
            // We map through them to pull out ONLY the skill data.
            const cleanAppends = data.appendPassive 
                ? data.appendPassive.map(slot => slot.skill) 
                : [];

            res.json({
                name: data.name,
                className: data.className,
                skills: data.skills,             // Active Skills (Translated by ?lang=en)
                np: data.noblePhantasms,         // NPs (Translated)
                classPassive: data.classPassive, // Passive Skills (Translated)
                appendPassive: cleanAppends      // [FIXED] Now Unwrapped & Translated
            });
        } else {
            res.status(404).json({ error: "Servant not found" });
        }
    } catch (error) {
        console.error("Error fetching servant:", error.message);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

module.exports = app;