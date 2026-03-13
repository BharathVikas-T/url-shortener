const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { initDB } = require('./db');
const urlRoutes = require('./routes/url');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/', urlRoutes);

const PORT = process.env.PORT || 3000;

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
