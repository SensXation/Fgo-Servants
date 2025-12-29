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
        // Fetch English data from Atlas Academy API
        const response = await axios.get(`https://api.atlasacademy.io/export/NA/nice_servant.json`);
        
        // Find the specific servant by ID (collectionNo)
        const servant = response.data.find(s => s.collectionNo == servantId);

        if (servant) {
            res.json({
                name: servant.name,
                className: servant.className,
                skills: servant.skills, // Contains English skill names/descriptions
                np: servant.noblePhantasms // Contains English NP data
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