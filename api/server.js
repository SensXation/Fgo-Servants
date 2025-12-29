const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/', (req, res) => res.send("Backend Live"));
app.get('/api/hello', (req, res) => res.json({ message: 'Backend Connected' }));

app.get('/api/servant/:id', async (req, res) => {
    const servantId = req.params.id;
    try {
        const response = await axios.get(`https://api.atlasacademy.io/export/NA/nice_servant.json`);
        const servant = response.data.find(s => s.collectionNo == servantId);

        if (servant) {
            res.json({
                name: servant.name,
                className: servant.className,
                skills: servant.skills,
                np: servant.noblePhantasms,
                classPassive: servant.classPassive,
                appendPassive: servant.appendPassive // <--- THIS LINE IS CRITICAL
            });
        } else {
            res.status(404).json({ error: "Servant not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch" });
    }
});

module.exports = app;