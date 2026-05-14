require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const { checkAuth, checkAdmin } = require('./src/middleware/auth');
const loginTemplate = require('./src/templates/login');
const dashboardTemplate = require('./src/templates/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new pgSession({ pool: pool, tableName: 'session' }),
  secret: process.env.SESSION_SECRET || 'cashiepie_pro_secure_session_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 }
}));

app.set('trust proxy', 1);

async function initDb() {
  try {
    console.log('--- VERCEL POSTGRES SYNC START ---');
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

      await client.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL,
          type VARCHAR(50) NOT NULL,
          amount DECIMAL(15, 2) NOT NULL,
          status VARCHAR(50) DEFAULT 'Pending',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS active_plans (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL,
          plan_name VARCHAR(100) NOT NULL,
          amount DECIMAL(15, 2) NOT NULL,
          roi DECIMAL(5, 2) NOT NULL,
          start_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          end_date TIMESTAMPTZ,
          status VARCHAR(50) DEFAULT 'Active',
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS tickets (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL,
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          reply TEXT,
          status VARCHAR(50) DEFAULT 'Open',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id SERIAL PRIMARY KEY,
          key_name VARCHAR(100) UNIQUE NOT NULL,
          value TEXT NOT NULL
        )
      `);

      const defaultSettings = [
        ['platform_name', 'CashiePie'],
        ['min_withdrawal', '50'],
        ['min_deposit', '100'],
        ['referral_bonus_percent', '10'],
        ['withdrawal_fee_percent', '2'],
        ['btc_address', 'TUKfCbvVxAjmXLqTyzxT6TjvBWAEckou9s'],
        ['support_email', 'support@cashiepie.com'],
        ['telegram_link', 'https://t.me/cashiepie'],
        ['whatsapp_link', 'https://wa.me/123456789'],
        ['site_status', 'Online']
      ];

      for (const [k, v] of defaultSettings) {
        await client.query('INSERT INTO settings (key_name, value) VALUES ($1, $2) ON CONFLICT (key_name) DO NOTHING', [k, v]);
      }

      const { rows: admins } = await client.query('SELECT * FROM users WHERE username = $1', ['@admin']);
      if (admins.length === 0) {
        await client.query('INSERT INTO users (username, password, name, role, referral_code) VALUES ($1, $2, $3, $4, $5)', ['@admin', 'admin123', 'Platform Admin', 'admin', 'ADMIN']);
      } else {
        await client.query('UPDATE users SET password = $1 WHERE username = $2', ['admin123', '@admin']);
      }

      console.log('--- DATABASE TABLES VERIFIED ---');
    } finally {
      client.release();
    }
    setInterval(processMaturity, 10 * 60 * 1000);
  } catch (err) { console.error('CRITICAL DATABASE ERROR:', err.message); }
}

async function processMaturity() {
  try {
    const { rows: plans } = await pool.query("SELECT * FROM active_plans WHERE status = 'Active' AND end_date <= NOW()");
    for (const plan of plans) {
      const totalReturn = parseFloat(plan.amount) + (parseFloat(plan.amount) * (parseFloat(plan.roi) / 100));
      await pool.query('UPDATE users SET profit = profit + $1, investment = investment - $2 WHERE id = $3', [totalReturn, plan.amount, plan.user_id]);
      await pool.query('UPDATE active_plans SET status = $1 WHERE id = $2', ['Completed', plan.id]);
    }
  } catch (e) { console.error('Maturity Error:', e); }
}

initDb();

app.get('/', async (req, res) => {
  if (req.session.userId) res.send(dashboardTemplate(req.session.role));
  else {
    const { rows } = await pool.query("SELECT value FROM settings WHERE key_name = 'whatsapp_link'");
    const whatsapp = rows[0]?.value || '123456';
    res.send(loginTemplate(whatsapp));
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
    if (rows.length > 0) {
      if (rows[0].status === 'Suspended') return res.json({ success: false, message: 'Account Suspended' });
      req.session.userId = rows[0].id;
      req.session.role = rows[0].role;
      req.session.save(() => res.json({ success: true }));
    } else res.json({ success: false, message: 'Invalid credentials' });
  } catch (err) { res.status(500).json({ error: 'DB Error' }); }
});

app.post('/api/register', async (req, res) => {
  const { username, password, confirmPassword, name, ref } = req.body;
  const finalUsername = username.startsWith('@') ? username : `@${username}`;
  try {
    const refCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await pool.query('INSERT INTO users (username, password, name, referral_code, referred_by) VALUES ($1, $2, $3, $4, $5)', [finalUsername, password, name, refCode, ref || null]);
    res.json({ success: true, message: 'Registration successful' });
  } catch (err) { res.json({ success: false, message: 'Username already taken' }); }
});

app.post('/api/logout', (req, res) => { req.session.destroy(() => res.json({ success: true })); });

app.post('/api/deposit', checkAuth, async (req, res) => {
  const { amount } = req.body;
  const { rows: s } = await pool.query("SELECT value FROM settings WHERE key_name = 'min_deposit'");
  if (amount < parseFloat(s[0].value)) return res.json({ success: false, message: `Min deposit is $${s[0].value}` });
  await pool.query("INSERT INTO transactions (user_id, type, amount, status) VALUES ($1, 'Deposit', $2, 'Pending')", [req.session.userId, amount]);
  res.json({ success: true, message: 'Deposit request sent' });
});

app.post('/api/withdraw', checkAuth, async (req, res) => {
  const { amount } = req.body;
  const { rows: s } = await pool.query("SELECT value FROM settings WHERE key_name = 'min_withdrawal'");
  if (amount < parseFloat(s[0].value)) return res.json({ success: false, message: `Min withdrawal is $${s[0].value}` });
  const { rows: u } = await pool.query('SELECT balance, profit FROM users WHERE id = $1', [req.session.userId]);
  if ((parseFloat(u[0].balance) + parseFloat(u[0].profit)) < amount) return res.json({ success: false, message: 'Insufficient funds' });
  await pool.query("INSERT INTO transactions (user_id, type, amount, status) VALUES ($1, 'Withdrawal', $2, 'Pending')", [req.session.userId, amount]);
  res.json({ success: true, message: 'Withdrawal request sent' });
});

app.post('/api/plan/buy', checkAuth, async (req, res) => {
  const { planName, amount, roi, days } = req.body;
  const { rows: u } = await pool.query('SELECT balance FROM users WHERE id = $1', [req.session.userId]);
  if (parseFloat(u[0].balance) < amount) return res.json({ success: false, message: 'Insufficient balance' });
  const endDate = new Date(); endDate.setDate(endDate.getDate() + days);
  await pool.query('UPDATE users SET balance = balance - $1, investment = investment + $2 WHERE id = $3', [amount, amount, req.session.userId]);
  await pool.query('INSERT INTO active_plans (user_id, plan_name, amount, roi, end_date) VALUES ($1, $2, $3, $4, $5)', [req.session.userId, planName, amount, roi, endDate]);
  res.json({ success: true, message: `Investment confirmed!` });
});

app.post('/api/ticket/create', checkAuth, async (req, res) => {
  const { subject, message } = req.body;
  await pool.query('INSERT INTO tickets (user_id, subject, message) VALUES ($1, $2, $3)', [req.session.userId, subject, message]);
  res.json({ success: true, message: 'Ticket created' });
});

app.post('/api/admin/tx/process', checkAdmin, async (req, res) => {
  const { txId, action } = req.body;
  const { rows: txs } = await pool.query('SELECT * FROM transactions WHERE id = $1', [txId]);
  if (txs.length === 0 || txs[0].status !== 'Pending') return res.json({ success: false });
  const tx = txs[0];
  if (action === 'Approved') {
    if (tx.type === 'Deposit') {
      await pool.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [tx.amount, tx.user_id]);
      const { rows: u } = await pool.query('SELECT referred_by FROM users WHERE id = $1', [tx.user_id]);
      if (u[0].referred_by) {
        const { rows: bonus } = await pool.query("SELECT value FROM settings WHERE key_name = 'referral_bonus_percent'");
        const bonusAmt = (parseFloat(tx.amount) * parseFloat(bonus[0].value)) / 100;
        await pool.query('UPDATE users SET balance = balance + $1 WHERE referral_code = $2', [bonusAmt, u[0].referred_by]);
      }
    } else {
      const { rows: u } = await pool.query('SELECT balance, profit FROM users WHERE id = $1', [tx.user_id]);
      let rem = parseFloat(tx.amount); let p = parseFloat(u[0].profit), b = parseFloat(u[0].balance);
      if (p >= rem) p -= rem; else { rem -= p; p = 0; b -= rem; }
      await pool.query('UPDATE users SET balance = $1, profit = $2 WHERE id = $3', [b, p, tx.user_id]);
    }
  }
  await pool.query('UPDATE transactions SET status = $1 WHERE id = $2', [action, txId]);
  res.json({ success: true });
});

app.post('/api/admin/settings/update', checkAdmin, async (req, res) => {
  const { key, value } = req.body;
  await pool.query('UPDATE settings SET value = $1 WHERE key_name = $2', [value, key]);
  res.json({ success: true });
});

app.post('/api/admin/user/update', checkAdmin, async (req, res) => {
  const { userId, name, balance, profit, investment, status } = req.body;
  await pool.query('UPDATE users SET name = $1, balance = $2, profit = $3, investment = $4, status = $5 WHERE id = $6', [name, balance, profit, investment, status, userId]);
  res.json({ success: true });
});

app.post('/api/admin/user/delete', checkAdmin, async (req, res) => {
  const { userId } = req.body;
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  res.json({ success: true });
});

app.post('/api/admin/ticket/reply', checkAdmin, async (req, res) => {
  const { ticketId, reply } = req.body;
  await pool.query("UPDATE tickets SET reply = $1, status = 'Closed' WHERE id = $2", [reply, ticketId]);
  res.json({ success: true });
});

app.get('/api/user/data', checkAuth, async (req, res) => {
  const { rows: u } = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
  const { rows: txs } = await pool.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 15', [req.session.userId]);
  const { rows: tickets } = await pool.query('SELECT * FROM tickets WHERE user_id = $1 ORDER BY created_at DESC', [req.session.userId]);
  const { rows: settings } = await pool.query('SELECT * FROM settings');
  const setObj = {}; settings.forEach(s => setObj[s.key_name] = s.value);
  res.json({ user: u[0], transactions: txs, tickets, settings: setObj });
});

app.get('/api/admin/data', checkAdmin, async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const { rows: users } = await pool.query("SELECT * FROM users WHERE role = 'user'");
  const { rows: pending } = await pool.query('SELECT t.*, u.name as "userName" FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.status = \'Pending\'');
  const { rows: history } = await pool.query('SELECT t.*, u.name as "userName" FROM transactions t JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC LIMIT $1', [limit]);
  const { rows: tickets } = await pool.query('SELECT tk.*, u.name as "userName" FROM tickets tk JOIN users u ON tk.user_id = u.id ORDER BY tk.created_at DESC');
  const { rows: settings } = await pool.query('SELECT * FROM settings');
  let stats = { totalBal: 0, totalInv: 0, users: users.length };
  users.forEach(u => { stats.totalBal += parseFloat(u.balance); stats.totalInv += parseFloat(u.investment); });
  res.json({ stats, users, pending, globalHistory: history, tickets, settings });
});

app.listen(PORT, () => console.log(`CashiePie running on port ${PORT}`));

module.exports = app;
