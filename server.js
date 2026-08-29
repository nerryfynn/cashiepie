require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// === SITE TAKEDOWN NOTICE ===
// All routes will display this message
const TAKEDOWN_MESSAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>🔒 Site Temporarily Unavailable</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #0b0e1a 0%, #1a1f35 50%, #0b0e1a 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            max-width: 720px;
            width: 100%;
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 32px;
            padding: 60px 40px;
            text-align: center;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
            animation: fadeIn 0.8s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .lock-icon {
            font-size: 72px;
            margin-bottom: 24px;
            display: block;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        h1 {
            color: #ffffff;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin-bottom: 16px;
        }
        .subtitle {
            color: #f0b34b;
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 20px;
        }
        .divider {
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, #f0b34b, #d4881e);
            border-radius: 4px;
            margin: 20px auto;
        }
        .message {
            color: rgba(255, 255, 255, 0.75);
            font-size: 16px;
            line-height: 1.7;
            margin-bottom: 12px;
        }
        .message strong {
            color: #ffffff;
        }
        .badge {
            display: inline-block;
            background: rgba(240, 179, 75, 0.12);
            border: 1px solid rgba(240, 179, 75, 0.20);
            color: #f0b34b;
            padding: 6px 18px;
            border-radius: 100px;
            font-size: 13px;
            font-weight: 500;
            margin-top: 24px;
            letter-spacing: 0.3px;
        }
        .footer {
            margin-top: 32px;
            color: rgba(255, 255, 255, 0.25);
            font-size: 13px;
        }
        @media (max-width: 480px) {
            .container { padding: 40px 24px; }
            h1 { font-size: 24px; }
            .lock-icon { font-size: 56px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <span class="lock-icon">🔒</span>
        <h1>Site Temporarily Unavailable</h1>
        <div class="subtitle">⚠️ Maintenance in Progress</div>
        <div class="divider"></div>
        <p class="message">
            We have detected <strong>suspicious activity</strong> on our platform.
        </p>
        <p class="message">
            As a precautionary measure, the site has been temporarily taken down
            while our security team conducts a thorough investigation.
        </p>
        <p class="message" style="margin-top: 16px;">
            🛡️ We take the safety of our users and their data very seriously.
        </p>
        <div class="badge">🔄 Service Restoration Pending</div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} CashiePie — All Rights Reserved
        </div>
    </div>
</body>
</html>
`;

// === MIDDLEWARE: Block all requests with takedown message ===
app.use((req, res, next) => {
    res.status(503).send(TAKEDOWN_MESSAGE);
});

// === Minimal DB Init (optional — still initializes but never routes) ===
const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.VERCEL_POSTGRES_URL;
if (!dbUrl) {
    console.error('⚠️ CRITICAL CONFIG ERROR: Missing Postgres connection URL.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
});

async function initDb() {
    try {
        const client = await pool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS "session" (
                  "sid" varchar NOT NULL COLLATE "default",
                  "sess" json NOT NULL,
                  "expire" timestamp(6) NOT NULL
                ) WITH (OIDS=FALSE);
                ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_pkey";
                ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
                CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
            `).catch(() => {});

            await client.query(`
                CREATE TABLE IF NOT EXISTS users (
                  id SERIAL PRIMARY KEY,
                  username VARCHAR(255) NOT NULL UNIQUE,
                  password VARCHAR(255) NOT NULL,
                  role VARCHAR(50) DEFAULT 'user',
                  name VARCHAR(255) NOT NULL,
                  balance DECIMAL(15, 2) DEFAULT 0,
                  investment DECIMAL(15, 2) DEFAULT 0,
                  profit DECIMAL(15, 2) DEFAULT 0,
                  referral_code VARCHAR(50) UNIQUE,
                  referred_by VARCHAR(50),
                  status VARCHAR(50) DEFAULT 'Active',
                  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Database tables verified (takedown mode active)');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('⚠️ Database init warning (site is in takedown mode):', err.message);
    }
}

initDb();

// === Start Server ===
if (!process.env.VERCEL && require.main === module) {
    app.listen(PORT, () => {
        console.log(`🔒 CashiePie is in TAKEDOWN MODE — all requests blocked`);
        console.log(`📡 Server running on port ${PORT}`);
    });
}

module.exports = app;
