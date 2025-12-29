const express = require('express');
const axios = require('axios'); // You might need to run: npm install axios
const cors = require('cors');
const app = express();

app.use(cors());

// Root route
app.get('/', (req, res) => res.send("FGO Translator Backend is Live"));

// Test route
app.get('/api/hello', (req, res) => res.json({ message: 'Connected to Backend!' }));

// --- NEW: TRANSLATION ENDPOINT ---
// Usage: /api/servant/2 (Gets data for Artoria Pendragon in English)
app.get('/api/servant/:id', async (req, res) => {
    const servantId = req.params.id;
    try {
        const response = await axios.get(`https://api.atlasacademy.io/export/NA/nice_servant.json`);
        
        // Find the servant
        const servant = response.data.find(s => s.collectionNo == servantId);

        if (servant) {
            res.json({
                name: servant.name,
                className: servant.className,
                skills: servant.skills,           // Active Skills
                np: servant.noblePhantasms,       // Noble Phantasm
                classPassive: servant.classPassive, // <--- NEW: Passive Skills
                appendPassive: servant.appendPassive // <--- NEW: Append Skills
            });
        } else {
            res.status(404).json({ error: "Servant not found in NA database" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

module.exports = app;