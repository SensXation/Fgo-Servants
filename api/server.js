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
        // [FIX] Fetch ONLY the specific servant (Faster & more reliable)
        // We use collectionNo to find the specific servant in NA
        const response = await axios.get(`https://api.atlasacademy.io/nice/NA/servant/${servantId}`);
        
        const servant = response.data;

        if (servant) {
            res.json({
                name: servant.name,
                className: servant.className,
                skills: servant.skills,
                np: servant.noblePhantasms,
                classPassive: servant.classPassive,
                // [FIX] Ensure Append Skills are explicitly sent
                appendPassive: servant.appendPassive 
            });
        } else {
            res.status(404).json({ error: "Servant not found" });
        }
    } catch (error) {
        // If 404 (Servant not in NA yet), return error
        console.error("Error fetching servant:", error.message);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

module.exports = app;