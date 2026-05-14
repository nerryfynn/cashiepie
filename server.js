require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { sql } = require('@vercel/postgres');
const { checkAuth, checkAdmin } = require('./src/middleware/auth');
const loginTemplate = require('./src/templates/login');
const dashboardTemplate = require('./src/templates/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'cashiepie_pro_secure_session_2026',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

async function initDb() {
  try {
    console.log('--- VERCEL POSTGRES SYNC START ---');
    
    await sql`
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
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await sql`
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
    `;

    await sql`
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
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key_name VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL
      )
    `;

    // Default Settings
    const defaultSettings = [
      ['platform_name', 'CashiePie'],
      ['min_withdrawal', '50'],
      ['min_deposit', '100'],
      ['referral_bonus_percent', '10'],
      ['withdrawal_fee_percent', '2'],
      ['btc_address', 'TUKfCbvVxAjmXLqTyzxT6TjvBWAEckou9s'],
      ['eth_address', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'],
      ['usdt_trc20', 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'],
      ['support_email', 'support@cashiepie.com'],
      ['telegram_link', 'https://t.me/cashiepie'],
      ['whatsapp_link', 'https://wa.me/123456789'],
      ['site_status', 'Online']
    ];

    for (const [k, v] of defaultSettings) {
      await sql`INSERT INTO settings (key_name, value) VALUES (${k}, ${v}) ON CONFLICT (key_name) DO NOTHING`;
    }

    const { rows: admins } = await sql`SELECT * FROM users WHERE username = '@admin'`;
    if (admins.length === 0) {
      await sql`INSERT INTO users (username, password, name, role, referral_code) VALUES ('@admin', 'admin123', 'Platform Admin', 'admin', 'ADMIN')`;
    } else {
      await sql`UPDATE users SET password = 'admin123' WHERE username = '@admin'`;
    }

    console.log('--- DATABASE TABLES VERIFIED ---');
    console.log('CashiePie Database Ready.');
    setInterval(processMaturity, 10 * 60 * 1000);
  } catch (err) { 
    console.error('CRITICAL DATABASE ERROR:', err.message); 
  }
}

async function processMaturity() {
  try {
    const { rows: plans } = await sql`SELECT * FROM active_plans WHERE status = 'Active' AND end_date <= NOW()`;
    for (const plan of plans) {
      const totalReturn = parseFloat(plan.amount) + (parseFloat(plan.amount) * (parseFloat(plan.roi) / 100));
      await sql`UPDATE users SET profit = profit + ${totalReturn}, investment = investment - ${plan.amount} WHERE id = ${plan.user_id}`;
      await sql`UPDATE active_plans SET status = 'Completed' WHERE id = ${plan.id}`;
    }
  } catch (e) { console.error('Maturity Error:', e); }
}

initDb();

app.get('/', (req, res) => {
  if (req.session.userId) res.send(dashboardTemplate(req.session.role));
  else res.send(loginTemplate());
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await sql`SELECT * FROM users WHERE username = ${username} AND password = ${password}`;
    if (rows.length > 0) {
      if (rows[0].status === 'Suspended') return res.json({ success: false, message: 'Account Suspended' });
      req.session.userId = rows[0].id;
      req.session.role = rows[0].role;
      res.json({ success: true });
    } else res.json({ success: false, message: 'Invalid credentials' });
  } catch (err) { res.status(500).json({ error: 'DB Error' }); }
});

app.post('/api/register', async (req, res) => {
  const { username, password, confirmPassword, name, ref } = req.body;
  const finalUsername = username.startsWith('@') ? username : `@${username}`;
  const usernameRegex = /^@[a-zA-Z0-9_]+$/;

  if (!usernameRegex.test(finalUsername)) return res.json({ success: false, message: 'Usernames only allow text, numbers, and underscore.' });
  if (password.length < 6) return res.json({ success: false, message: 'Password must be at least 6 characters.' });
  if (password !== confirmPassword) return res.json({ success: false, message: 'Passwords do not match.' });

  const refCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  try {
    await sql`INSERT INTO users (username, password, name, referral_code, referred_by) VALUES (${finalUsername}, ${password}, ${name}, ${refCode}, ${ref || null})`;
    res.json({ success: true, message: 'Registration successful' });
  } catch (err) { res.json({ success: false, message: 'Username already taken' }); }
});

app.post('/api/logout', (req, res) => { req.session.destroy(() => res.json({ success: true })); });

app.post('/api/deposit', checkAuth, async (req, res) => {
  const { amount } = req.body;
  const { rows: s } = await sql`SELECT value FROM settings WHERE key_name = 'min_deposit'`;
  if (amount < parseFloat(s[0].value)) return res.json({ success: false, message: `Minimum deposit is $${s[0].value}` });
  await sql`INSERT INTO transactions (user_id, type, amount, status) VALUES (${req.session.userId}, 'Deposit', ${amount}, 'Pending')`;
  res.json({ success: true, message: 'Deposit request sent' });
});

app.post('/api/withdraw', checkAuth, async (req, res) => {
  const { amount } = req.body;
  const { rows: s } = await sql`SELECT value FROM settings WHERE key_name = 'min_withdrawal'`;
  if (amount < parseFloat(s[0].value)) return res.json({ success: false, message: `Minimum withdrawal is $${s[0].value}` });

  const { rows: u } = await sql`SELECT balance, profit FROM users WHERE id = ${req.session.userId}`;
  const total = parseFloat(u[0].balance) + parseFloat(u[0].profit);
  if (total < amount) return res.json({ success: false, message: 'Insufficient funds' });

  await sql`INSERT INTO transactions (user_id, type, amount, status) VALUES (${req.session.userId}, 'Withdrawal', ${amount}, 'Pending')`;
  res.json({ success: true, message: 'Withdrawal request sent' });
});

app.post('/api/plan/buy', checkAuth, async (req, res) => {
  const { planName, amount, roi, days } = req.body;
  const { rows: u } = await sql`SELECT balance FROM users WHERE id = ${req.session.userId}`;
  if (parseFloat(u[0].balance) < amount) return res.json({ success: false, message: 'Insufficient balance' });
  
  const endDate = new Date(); endDate.setDate(endDate.getDate() + days);
  await sql`UPDATE users SET balance = balance - ${amount}, investment = investment + ${amount} WHERE id = ${req.session.userId}`;
  await sql`INSERT INTO active_plans (user_id, plan_name, amount, roi, end_date) VALUES (${req.session.userId}, ${planName}, ${amount}, ${roi}, ${endDate})`;
  res.json({ success: true, message: `Investment confirmed!` });
});

app.post('/api/ticket/create', checkAuth, async (req, res) => {
  const { subject, message } = req.body;
  await sql`INSERT INTO tickets (user_id, subject, message) VALUES (${req.session.userId}, ${subject}, ${message})`;
  res.json({ success: true, message: 'Ticket created' });
});

app.post('/api/admin/tx/process', checkAdmin, async (req, res) => {
  const { txId, action } = req.body;
  const { rows: txs } = await sql`SELECT * FROM transactions WHERE id = ${txId}`;
  if (txs.length === 0) return res.json({ success: false });
  const tx = txs[0];
  if (tx.status !== 'Pending') return res.json({ success: false });

  if (action === 'Approved') {
    if (tx.type === 'Deposit') {
      await sql`UPDATE users SET balance = balance + ${tx.amount} WHERE id = ${tx.user_id}`;
      const { rows: u } = await sql`SELECT referred_by FROM users WHERE id = ${tx.user_id}`;
      if (u[0].referred_by) {
        const { rows: bonus } = await sql`SELECT value FROM settings WHERE key_name = 'referral_bonus_percent'`;
        const bonusAmt = (parseFloat(tx.amount) * parseFloat(bonus[0].value)) / 100;
        await sql`UPDATE users SET balance = balance + ${bonusAmt} WHERE referral_code = ${u[0].referred_by}`;
      }
    } else {
      const { rows: u } = await sql`SELECT balance, profit FROM users WHERE id = ${tx.user_id}`;
      let rem = parseFloat(tx.amount);
      let p = parseFloat(u[0].profit), b = parseFloat(u[0].balance);
      if (p >= rem) p -= rem; else { rem -= p; p = 0; b -= rem; }
      await sql`UPDATE users SET balance = ${b}, profit = ${p} WHERE id = ${tx.user_id}`;
    }
  }
  await sql`UPDATE transactions SET status = ${action} WHERE id = ${txId}`;
  res.json({ success: true });
});

app.post('/api/admin/settings/update', checkAdmin, async (req, res) => {
  const { key, value } = req.body;
  await sql`UPDATE settings SET value = ${value} WHERE key_name = ${key}`;
  res.json({ success: true });
});

app.post('/api/admin/user/profit', checkAdmin, async (req, res) => {
  const { userId, amount } = req.body;
  await sql`UPDATE users SET profit = profit + ${amount} WHERE id = ${userId}`;
  res.json({ success: true });
});

app.post('/api/admin/ticket/reply', checkAdmin, async (req, res) => {
  const { ticketId, reply } = req.body;
  await sql`UPDATE tickets SET reply = ${reply}, status = 'Closed' WHERE id = ${ticketId}`;
  res.json({ success: true });
});

app.post('/api/admin/user/update', checkAdmin, async (req, res) => {
  const { userId, name, balance, profit, investment, status } = req.body;
  await sql`UPDATE users SET name = ${name}, balance = ${balance}, profit = ${profit}, investment = ${investment}, status = ${status} WHERE id = ${userId}`;
  res.json({ success: true });
});

app.post('/api/admin/user/delete', checkAdmin, async (req, res) => {
  const { userId } = req.body;
  await sql`DELETE FROM users WHERE id = ${userId}`;
  res.json({ success: true });
});

app.get('/api/user/data', checkAuth, async (req, res) => {
  const { rows: u } = await sql`SELECT * FROM users WHERE id = ${req.session.userId}`;
  const { rows: txs } = await sql`SELECT * FROM transactions WHERE user_id = ${req.session.userId} ORDER BY created_at DESC LIMIT 15`;
  const { rows: tickets } = await sql`SELECT * FROM tickets WHERE user_id = ${req.session.userId} ORDER BY created_at DESC`;
  const { rows: settings } = await sql`SELECT * FROM settings`;
  const setObj = {}; settings.forEach(s => setObj[s.key_name] = s.value);
  res.json({ user: u[0], transactions: txs, tickets, settings: setObj });
});

app.get('/api/admin/data', checkAdmin, async (req, res) => {
  const { rows: users } = await sql`SELECT * FROM users WHERE role = 'user'`;
  const { rows: pending } = await sql`SELECT t.*, u.name as "userName" FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.status = 'Pending'`;
  const { rows: tickets } = await sql`SELECT tk.*, u.name as "userName" FROM tickets tk JOIN users u ON tk.user_id = u.id WHERE tk.status = 'Open'`;
  const { rows: settings } = await sql`SELECT * FROM settings`;
  let stats = { totalBal: 0, totalInv: 0, users: users.length };
  users.forEach(u => { stats.totalBal += parseFloat(u.balance); stats.totalInv += parseFloat(u.investment); });
  res.json({ stats, users, pending, tickets, settings });
});

app.listen(PORT, () => console.log(`CashiePie running on port ${PORT}`));

module.exports = app;
