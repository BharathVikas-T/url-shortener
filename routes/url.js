const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const redis = require('../cache');
const { nanoid } = require('nanoid');

router.post('/shorten', async (req, res) => {
    const { original_url } = req.body;

    if (!original_url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const short_code = nanoid(6);

        const result = await pool.query(
            'INSERT INTO urls (original_url, short_code) VALUES ($1, $2) RETURNING *',
            [original_url, short_code]
        );

        await redis.setex(short_code, 86400, original_url);

        res.status(201).json({
            original_url,
            short_url: `${req.protocol}://${req.get('host')}/${short_code}`
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:short_code', async (req, res) => {
    const { short_code } = req.params;

    try {
        const cached = await redis.get(short_code);
        if (cached) {
            console.log('Cache hit');
            return res.redirect(cached);
        }

        const result = await pool.query(
            'SELECT original_url FROM urls WHERE short_code = $1',
            [short_code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'URL not found' });
        }

        const original_url = result.rows[0].original_url;
        await redis.setex(short_code, 86400, original_url);

        console.log('Cache miss - fetched from DB');
        res.redirect(original_url);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;