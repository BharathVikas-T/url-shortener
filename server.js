const express = require('express');
const app = express();
require('dotenv').config();
const { initDB } = require('./db');
const urlRoutes = require('./routes/url');

app.use(express.json());
app.use('/', urlRoutes);

const PORT = process.env.PORT || 3000;

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});