require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// === SITE TAKEDOWN NOTICE ===
app.use((req, res) => {
    res.status(503).send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title></title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background: white;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    </style>
</head>
<body>
</body>
</html>
    `);
});

// === Minimal DB Init (prevents crashes) ===
const { Pool } = require('pg');
const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.VERCEL_POSTGRES_URL;

if (dbUrl) {
    const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });
    
    pool.query('SELECT 1').catch(() => {});
}

if (!process.env.VERCEL && require.main === module) {
    app.listen(PORT, () => {
        console.log(`Site is in takedown mode on port ${PORT}`);
    });
}

module.exports = app;
