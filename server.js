require('dotenv').config();
const express = require('express');
session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// === SITE TAKEDOWN NOTICE ===
const TAKEDOWN_MESSAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Site Taken Down</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            background: #1a0000;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            max-width: 700px;
            width: 100%;
            background: #0d0000;
            border: 2px solid #8b0000;
            border-radius: 6px;
            padding: 50px 40px;
            text-align: center;
        }
        .icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        h1 {
            color: #cc0000;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: 1px;
        }
        .sub {
            color: #ff3333;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 25px;
        }
        .line {
            width: 60px;
            height: 2px;
            background: #8b0000;
            margin: 0 auto 25px auto;
        }
        .msg {
            color: #cccccc;
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 12px;
        }
        .msg strong {
            color: #ff3333;
        }
        .box {
            background: rgba(139, 0, 0, 0.1);
            border: 1px solid #4a0000;
            padding: 18px 22px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .box p {
            color: #bbbbbb;
            font-size: 15px;
            line-height: 1.7;
        }
        .badge {
            display: inline-block;
            border: 1px solid #8b0000;
            color: #cc0000;
            padding: 8px 24px;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 1px;
            margin-top: 15px;
            background: rgba(139, 0, 0, 0.1);
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #1a0000;
            color: #4a0000;
            font-size: 12px;
        }
        @media (max-width: 480px) {
            .container { padding: 30px 20px; }
            h1 { require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// === SITE TAKEDOWN NOTICE ===
const TAKEDOWN_MESSAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Site Taken Down</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            background: #1a0000;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            max-width: 700px;
            width: 100%;
            background: #0d0000;
            border: 2px solid #8b0000;
            border-radius: 6px;
            padding: 50px 40px;
            text-align: center;
        }
        .icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        h1 {
            color: #cc0000;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: 1px;
        }
        .sub {
            color: #ff3333;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 25px;
        }
        .line {
            width: 60px;
            height: 2px;
            background: #8b0000;
            margin: 0 auto 25px auto;
        }
        .msg {
            color: #cccccc;
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 12px;
        }
        .msg strong {
            color: #ff3333;
        }
        .box {
            background: rgba(139, 0, 0, 0.1);
            border: 1px solid #4a0000;
            padding: 18px 22px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .box p {
            color: #bbbbbb;
            font-size: 15px;
            line-height: 1.7;
        }
        .badge {
            display: inline-block;
            border: 1px solid #8b0000;
            color: #cc0000;
            padding: 8px 24px;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 1px;
            margin-top: 15px;
            background: rgba(139, 0, 0, 0.1);
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #1a0000;
            color: #4a0000;
            font-size: 12px;
        }
        @media (max-width: 480px) {
            .container { padding: 30px 20px; }
            h1 { font-size: 24px; }
            .icon { font-size: 48px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">⛔</div>
        <h1>Site Taken Down</h1>
        <div class="sub">Suspicious Activity Detected</div>
        <div class="line"></div>
        
        <p class="msg">
            This platform has been <strong>taken down</strong> due to detected
            suspicious activity.
        </p>
        
        <div class="box">
            <p>
                Our security systems have flagged unusual patterns requiring
                immediate investigation. All services are suspended until further notice.
            </p>
        </div>
        
        <p class="msg">
            A full security review is currently underway.
        </p>
        
        <p class="msg" style="color: #888888; font-size: 14px; margin-top: 10px;">
            Affected users will be contacted once the investigation is complete.
        </p>
        
        <div class="badge">⛔ Access Restricted</div>
        
        <div class="footer">
            CashiePie — All Rights Reserved
        </div>
    </div>
</body>
</html>
`;

// === MIDDLEWARE: Block all requests ===
app.use((req, res, next) => {
    res.status(503).send(TAKEDOWN_MESSAGE);
});

// === Minimal DB Init ===
const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.VERCEL_POSTGRES_URL;
if (!dbUrl) {
    console.error('⚠️ Missing Postgres connection URL.');
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
            console.log('✅ Database ready (takedown mode)');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('⚠️ DB init warning:', err.message);
    }
}

initDb();

if (!process.env.VERCEL && require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚫 Site in TAKEDOWN MODE — port ${PORT}`);
    });
}

module.exports = app;￼Enterfont-size: 24px; }
            .icon { font-size: 48px; }
