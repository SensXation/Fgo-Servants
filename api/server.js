const express = require('express');
const app = express();
const cors = require('cors'); // Import cors

// Allow the frontend to talk to this backend
app.use(cors()); 

app.get('/api/hello', (req, res) => {
    res.json({ message: 'FGO Backend Working' });
});


module.exports = app;