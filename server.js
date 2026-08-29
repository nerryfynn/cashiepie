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
    <title>Site Taken Down</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
            text-align: center;
        }
        h1 {
            color: #d32f2f;
            font-size: 28px;
            margin-bottom: 10px;
        }
        p {
            color: #555;
            line-height: 1.6;
            margin: 15px 0;
        }
        .line {
            width: 50px;
            height: 2px;
            background: #d32f2f;
            margin: 20px auto;
        }
        .footer {
            margin-top: 30px;
            font-size: 13px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Site Taken Down</h1>
        <div class="line"></div>
        <p><strong>Suspicious activity noticed.</strong></p>
        <p>The site has been taken down for security review.</p>
        <p style="font-size:14px; color:#888;">Please check back later.</p>
    </div>
</body>
</html>
    `);
});

// === Minimal DB Init (so it doesn't crash) ===
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
        console.log(`Site in takedown mode on port ${PORT}`);
    });
}

module.exports = app;
