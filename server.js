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
    <title>⛔ Access Restricted</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Courier New', monospace;
            background: #0a0000;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            position: relative;
        }
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 50%, rgba(139, 0, 0, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(139, 0, 0, 0.2) 0%, transparent 50%),
                linear-gradient(180deg, #0a0000 0%, #1a0000 50%, #0a0000 100%);
            z-index: 0;
        }
        .container {
            position: relative;
            z-index: 1;
            max-width: 780px;
            width: 100%;
            background: rgba(10, 0, 0, 0.95);
            border: 2px solid #8b0000;
            border-radius: 8px;
            padding: 50px 45px;
            text-align: center;
            box-shadow: 
                0 0 60px rgba(139, 0, 0, 0.3),
                inset 0 0 60px rgba(139, 0, 0, 0.1);
            animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .top-bar {
            border-top: 3px solid #8b0000;
            border-bottom: 1px solid #8b0000;
            padding: 10px 0;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #8b0000;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .top-bar .blink {
            animation: blink 1s infinite;
        }
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
        .alert-icon {
            font-size: 72px;
            margin-bottom: 15px;
            display: block;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        h1 {
            color: #cc0000;
            font-size: 38px;
            font-weight: 900;
            letter-spacing: 4px;
            text-transform: uppercase;
            margin-bottom: 10px;
            text-shadow: 0 0 30px rgba(204, 0, 0, 0.3);
        }
        .divider {
            width: 100px;
            height: 2px;
            background: #8b0000;
            margin: 20px auto;
            box-shadow: 0 0 20px rgba(139, 0, 0, 0.5);
        }
        .subtitle {
            color: #ff3333;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 25px;
        }
        .message {
            color: #cccccc;
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 12px;
            font-family: 'Segoe UI', Arial, sans-serif;
        }
        .message strong {
            color: #ff3333;
            font-weight: 700;
        }
        .highlight-box {
            background: rgba(139, 0, 0, 0.15);
            border-left: 4px solid #cc0000;
            border-right: 4px solid #cc0000;
            padding: 20px 25px;
            margin: 25px 0;
            position: relative;
        }
        .highlight-box::before {
            content: '⚠';
            position: absolute;
            top: -12px;
            left: -12px;
            background: #0a0000;
            color: #ff3333;
            font-size: 20px;
            padding: 0 8px;
        }
        .highlight-box::after {
            content: '⚠';
            position: absolute;
            bottom: -12px;
            right: -12px;
            background: #0a0000;
            color: #ff3333;
            font-size: 20px;
            padding: 0 8px;
        }
        .highlight-box p {
            color: #e0e0e0;
            font-size: 15px;
            line-height: 1.7;
            font-family: 'Segoe UI', Arial, sans-serif;
        }
        .badge {
            display: inline-block;
            background: rgba(204, 0, 0, 0.2);
            border: 1px solid #8b0000;
            color: #ff3333;
            padding: 10px 30px;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-top: 20px;
            font-family: 'Courier New', monospace;
        }
        .badge span {
            animation: blink 1.2s infinite;
        }
        .footer {
            margin-top: 35px;
            padding-top: 20px;
            border-top: 1px solid #1a0000;
            color: #4a0000;
            font-size: 12px;
            letter-spacing: 1px;
            font-family: 'Courier New', monospace;
        }
        .footer .red {
            color: #8b0000;
        }
        .status-line {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin: 20px 0;
            color: #4a0000;
            font-size: 12px;
            font-family: 'Courier New', monospace;
            letter-spacing: 1px;
        }
        .status-line .active {
            color: #cc0000;
        }
        @media (max-width: 480px) {
            .container { padding: 30px 20px; }
            h1 { font-size: 28px; letter-spacing: 2px; }
            .alert-icon { font-size: 56px; }
            .subtitle { font-size: 15px; }
            .top-bar { font-size: 10px; flex-direction: column; gap: 5px; }
            .status-line { flex-direction: column; gap: 8px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="top-bar">
            <span>🔴 <span class="blink">●</span> SYSTEM ALERT</span>
            <span>ACCESS CODE: <span style="color: #cc0000;">RESTRICTED-2026</span></span>
            <span>🔴 <span class="blink">●</span> ACTIVE</span>
        </div>

        <span class="alert-icon">⛔</span>
        <h1>Access Denied</h1>
        <div class="divider"></div>
        <div class="subtitle">⚠️ Platform Suspended — Security Breach Detected</div>
        
        <p class="message">
            This platform has been <strong>immediately terminated</strong> following
            the detection of <strong>unauthorized activities</strong> and
            <strong>suspicious transactions</strong>.
        </p>
        
        <div class="highlight-box">
            <p>
                🔴 <strong style="color: #ff3333;">SECURITY NOTICE:</strong> Our monitoring systems have
                identified <strong style="color: #ff3333;">irregular patterns</strong> and
                <strong style="color: #ff3333;">potential fraudulent activity</strong>.
                All services are <strong style="color: #ff3333;">permanently suspended</strong>
                pending a full forensic investigation.
            </p>
        </div>
        
        <p class="message">
            🛡️ A <strong>complete security audit</strong> is currently underway.
            All user data has been <strong>secured and frozen</strong> for review.
        </p>
        
        <p class="message" style="margin-top: 15px; color: #888888; font-size: 14px;">
            📌 <strong style="color: #ff3333;">IMPORTANT:</strong> Affected parties will be
            <strong>contacted directly</strong> by our legal and compliance team
            upon conclusion of the investigation.
        </p>

        <div class="status-line">
            <span>STATUS: <span class="active">● SUSPENDED</span></span>
            <span>INVESTIGATION: <span class="active">● ACTIVE</span></span>
            <span>ACCESS: <span class="active">● REVOKED</span></span>
        </div>
        
        <div class="badge">
            <span>⛔ Restricted Area ⛔</span>
        </div>

        <div class="footer">
            <span class="red">◆</span> SYSTEM LOCKDOWN — ALL RIGHTS RESERVED <span class="red">◆</span>
            <br />
            <span style="color: #2a0000;">CashiePie Security Division — Incident Response Team</span>
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
        console.log(`🚫 CashiePie is in TAKEDOWN MODE — all requests blocked`);
        console.log(`📡 Server running on port ${PORT}`);
    });
}

module.exports = app;
