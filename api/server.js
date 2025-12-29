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
        // 1. Fetch JP data with English Language flag
        const response = await axios.get(`https://api.atlasacademy.io/nice/JP/servant/${servantId}?lang=en`);
        const data = response.data;

        if (data) {
            // --- THE FIX IS HERE ---
            // The API wraps append skills inside a "skill" object.
            // We map through it to "unwrap" it so your Frontend can read it.
            const cleanAppends = data.appendPassive 
                ? data.appendPassive.map(slot => slot.skill) 
                : [];

            res.json({
                name: data.name,
                className: data.className,
                skills: data.skills,
                np: data.noblePhantasms,
                classPassive: data.classPassive,
                appendPassive: cleanAppends 
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