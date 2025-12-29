const express = require('express');
const app = express();
const cors = require('cors'); // <--- YOU NEED THIS

// Allow everyone (including your GitHub Pages) to access this backend
app.use(cors()); 

app.get('/api/hello', (req, res) => {
    res.json({ message: 'FGO Backend Working' });
});

// app.listen(5000); // <--- Keep this commented out for Vercel
module.exports = app; // <--- Required for Vercel