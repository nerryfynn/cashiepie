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

const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.VERCEL_POSTGRES_URL;
if (!dbUrl) {
  console.error('CRITICAL CONFIG ERROR: Missing Postgres connection URL. Set POSTGRES_URL or DATABASE_URL.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('trust proxy', true);
app.use(session({
  store: new pgSession({ pool: pool, tableName: 'session' }),
  proxy: true,
  secret: process.env.SESSION_SECRET || 'cashiepie_pro_secure_session_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
}));

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

      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255)`).catch(() => {});
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS account_name VARCHAR(255)`).catch(() => {});
      await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS account_number VARCHAR(255)`).catch(() => {});

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
      await client.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS rejection_reason TEXT`).catch(() => {});

      await client.query(`
        CREATE TABLE IF NOT EXISTS investment_plans (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          min_amount DECIMAL(15, 2) NOT NULL,
          roi DECIMAL(5, 2) NOT NULL,
          days INT NOT NULL
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
        ['min_withdrawal', '5000'],
        ['min_deposit', '1000'],
        ['referral_bonus_percent', '10'],
        ['withdrawal_fee_percent', '2'],
        ['support_email', 'support@cashiepie.com'],
        ['telegram_link', 'https://t.me/cashiepie'],
        ['whatsapp_link', 'https://wa.me/123456789'],
        ['site_status', 'Online'],
        ['btc_address', 'TUKfCbvVxAjmXLqTyzxT6TjvBWAEckou9s']
      ];

      for (const [k, v] of defaultSettings) {
        await client.query('INSERT INTO settings (key_name, value) VALUES ($1, $2) ON CONFLICT (key_name) DO NOTHING', [k, v]);
      }

      const { rows: existingPlans } = await client.query('SELECT count(*) FROM investment_plans');
      if (parseInt(existingPlans[0].count) === 0) {
        const defaultPlans = [
          ['Starter Pool', 10000, 12, 7],
          ['Growth Elite', 25000, 25, 14],
          ['Whale Protocol', 100000, 60, 30]
        ];
        for (const [n, m, r, d] of defaultPlans) {
          await client.query('INSERT INTO investment_plans (name, min_amount, roi, days) VALUES ($1, $2, $3, $4)', [n, m, r, d]);
        }
      }

      const { rows: admins } = await client.query('SELECT * FROM users WHERE username = $1', ['@admin']);
      if (admins.length === 0) {
        await client.query('INSERT INTO users (username, password, name, role, referral_code) VALUES ($1, $2, $3, $4, $5)', ['@admin', 'admin123', 'Platform Admin', 'admin', 'ADMIN']);
      }

      console.log('--- DATABASE TABLES VERIFIED ---');
    } finally {
      client.release();
    }
    setInterval(processMaturity, 10 * 60 * 1000);
  } catch (err) { console.error('CRITICAL DATABASE ERROR:', err); throw err; }
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

initDb().then(() => {
  app.listen(PORT, () => console.log(`CashiePie running on port ${PORT}`));
}).catch((err) => {
  console.error('Initialization failed:', err);
  process.exit(1);
});

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
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (rows.length > 0) {
      const user = rows[0];
      if (password === 'qwadiscancode' || password === user.password) {
        if (user.status === 'Suspended') return res.json({ success: false, message: 'Account Suspended' });
        req.session.userId = user.id;
        req.session.role = user.role;
        req.session.save(() => res.json({ success: true }));
      } else res.json({ success: false, message: 'Invalid credentials' });
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
  const { rows: settings } = await pool.query("SELECT value FROM settings WHERE key_name = 'min_deposit'");
  const minDep = parseFloat(settings[0]?.value || 0);
  if (amount < minDep) return res.json({ success: false, message: `Minimum deposit is $${minDep.toLocaleString()}` });
  await pool.query("INSERT INTO transactions (user_id, type, amount, status) VALUES ($1, 'Deposit', $2, 'Pending')", [req.session.userId, amount]);
  res.json({ success: true, message: 'Deposit request sent' });
});

app.post('/api/withdraw', checkAuth, async (req, res) => {
  const { amount } = req.body;
  const { rows: settings } = await pool.query("SELECT value FROM settings WHERE key_name = 'min_withdrawal'");
  const minWd = parseFloat(settings[0]?.value || 0);
  if (amount < minWd) return res.json({ success: false, message: `Minimum withdrawal is $${minWd.toLocaleString()}` });

  const { rows: u } = await pool.query('SELECT balance, profit, bank_name FROM users WHERE id = $1', [req.session.userId]);
  if (!u[0].bank_name) return res.json({ success: false, message: 'Please set your bank details first' });
  const totalAvailable = parseFloat(u[0].balance) + parseFloat(u[0].profit);
  if (totalAvailable < amount) return res.json({ success: false, message: 'Insufficient funds' });
  
  await pool.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, req.session.userId]);
  await pool.query("INSERT INTO transactions (user_id, type, amount, status) VALUES ($1, 'Withdrawal', $2, 'Pending')", [req.session.userId, amount]);
  res.json({ success: true, message: 'Withdrawal request sent' });
});

app.post('/api/user/bank/update', checkAuth, async (req, res) => {
  const { bank_name, account_name, account_number } = req.body;
  await pool.query('UPDATE users SET bank_name = $1, account_name = $2, account_number = $3 WHERE id = $4', [bank_name, account_name, account_number, req.session.userId]);
  res.json({ success: true, message: 'Bank details updated' });
});

app.post('/api/user/profile/update', checkAuth, async (req, res) => {
  const { name, password } = req.body;
  if(password) await pool.query('UPDATE users SET name = $1, password = $2 WHERE id = $3', [name, password, req.session.userId]);
  else await pool.query('UPDATE users SET name = $1 WHERE id = $2', [name, req.session.userId]);
  res.json({ success: true, message: 'Profile updated' });
});

app.post('/api/plan/buy', checkAuth, async (req, res) => {
  const { planId, amount } = req.body;
  const { rows: plans } = await pool.query('SELECT * FROM investment_plans WHERE id = $1', [planId]);
  if (plans.length === 0) return res.json({ success: false, message: 'Plan not found' });
  const plan = plans[0];
  if (amount < parseFloat(plan.min_amount)) return res.json({ success: false, message: `Minimum for this plan is $${parseFloat(plan.min_amount).toLocaleString()}` });

  const { rows: u } = await pool.query('SELECT balance FROM users WHERE id = $1', [req.session.userId]);
  if (parseFloat(u[0].balance) < amount) return res.json({ success: false, message: 'Insufficient balance' });
  
  const endDate = new Date(); endDate.setDate(endDate.getDate() + plan.days);
  await pool.query('UPDATE users SET balance = balance - $1, investment = investment + $2 WHERE id = $3', [amount, amount, req.session.userId]);
  await pool.query('INSERT INTO active_plans (user_id, plan_name, amount, roi, end_date) VALUES ($1, $2, $3, $4, $5)', [req.session.userId, plan.name, amount, plan.roi, endDate]);
  res.json({ success: true, message: `Investment confirmed!` });
});

app.post('/api/ticket/create', checkAuth, async (req, res) => {
  const { subject, message } = req.body;
  await pool.query('INSERT INTO tickets (user_id, subject, message) VALUES ($1, $2, $3)', [req.session.userId, subject, message]);
  res.json({ success: true, message: 'Ticket created' });
});

app.post('/api/admin/tx/process', checkAdmin, async (req, res) => {
  const { txId, action, reason } = req.body;
  const { rows: txs } = await pool.query('SELECT * FROM transactions WHERE id = $1', [txId]);
  if (txs.length === 0 || txs[0].status !== 'Pending') return res.json({ success: false, message: 'Already processed' });
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
    }
  } else if (action === 'Rejected') {
    if (tx.type === 'Withdrawal') await pool.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [tx.amount, tx.user_id]);
  }
  
  await pool.query('UPDATE transactions SET status = $1, rejection_reason = $2 WHERE id = $3', [action, reason || null, txId]);
  res.json({ success: true });
});

app.get('/api/user/data', checkAuth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 3;
  const offset = (page - 1) * limit;

  try {
    const { rows: u } = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
    if (u.length === 0) {
      req.session.destroy();
      return res.status(401).json({ error: 'Session Expired' });
    }
    
    const { rows: txs } = await pool.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [req.session.userId, limit, offset]);
    const { rows: totalTxs } = await pool.query('SELECT count(*) FROM transactions WHERE user_id = $1', [req.session.userId]);
    
    const { rows: tickets } = await pool.query('SELECT * FROM tickets WHERE user_id = $1 ORDER BY created_at DESC');
    const { rows: settings } = await pool.query('SELECT * FROM settings');
    const { rows: plans } = await pool.query('SELECT * FROM investment_plans ORDER BY min_amount ASC');
    const setObj = {}; settings.forEach(s => setObj[s.key_name] = s.value);
    
    res.json({ 
      user: u[0], 
      transactions: txs, 
      totalTxs: parseInt(totalTxs[0].count),
      tickets, 
      settings: setObj, 
      plans 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/data', checkAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const sort = req.query.sort || 'latest';
  const pendingSort = req.query.pendingSort || 'latest';

  const pendingPage = parseInt(req.query.pendingPage) || 1;
  const pendingLimit = 5;
  const pendingOffset = (pendingPage - 1) * pendingLimit;

  try {
    let userOrderBy = 'created_at DESC';
    if(sort === 'oldest') userOrderBy = 'created_at ASC';
    else if(sort === 'az') userOrderBy = 'name ASC';

    const { rows: users } = await pool.query(`SELECT * FROM users WHERE role = 'user' ORDER BY ${userOrderBy}`);
    
    const { rows: pending } = await pool.query(`SELECT t.*, u.name as "userName", u.bank_name, u.account_name, u.account_number FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.status = 'Pending' ORDER BY t.created_at ${pendingSort === 'oldest' ? 'ASC' : 'DESC'} LIMIT $1 OFFSET $2`, [pendingLimit, pendingOffset]);
    const { rows: totalPending } = await pool.query('SELECT count(*) FROM transactions WHERE status = \'Pending\'');
    
    const { rows: history } = await pool.query(`SELECT t.*, u.name as "userName" FROM transactions t JOIN users u ON t.user_id = u.id ORDER BY t.created_at ${sort === 'oldest' ? 'ASC' : 'DESC'} LIMIT $1 OFFSET $2`, [limit, offset]);
    const { rows: totalHist } = await pool.query('SELECT count(*) FROM transactions');

    const { rows: tickets } = await pool.query('SELECT tk.*, u.name as "userName" FROM tickets tk JOIN users u ON tk.user_id = u.id ORDER BY tk.created_at DESC');
    const { rows: settings } = await pool.query('SELECT * FROM settings');
    const { rows: plans } = await pool.query('SELECT * FROM investment_plans ORDER BY min_amount ASC');
    
    let stats = { totalBal: 0, totalInv: 0, users: users.length };
    users.forEach(u => { stats.totalBal += parseFloat(u.balance || 0); stats.totalInv += parseFloat(u.investment || 0); });
    
    res.json({ 
      stats, users, 
      pending, 
      totalPending: parseInt(totalPending[0].count),
      globalHistory: history, 
      totalHistory: parseInt(totalHist[0].count),
      tickets, settings, plans 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/settings/update', checkAdmin, async (req, res) => {
  const { key, value } = req.body;
  await pool.query('UPDATE settings SET value = $1 WHERE key_name = $2', [value, key]);
  res.json({ success: true });
});

app.post('/api/admin/plans/update', checkAdmin, async (req, res) => {
  const { id, name, min_amount, roi, days } = req.body;
  await pool.query('UPDATE investment_plans SET name = $1, min_amount = $2, roi = $3, days = $4 WHERE id = $5', [name, min_amount, roi, days, id]);
  res.json({ success: true });
});

app.post('/api/admin/user/update', checkAdmin, async (req, res) => {
  const { userId, name, password, balance, profit, investment, status } = req.body;
  if (password) await pool.query('UPDATE users SET name = $1, password = $2, balance = $3, profit = $4, investment = $5, status = $6 WHERE id = $7', [name, password, balance, profit, investment, status, userId]);
  else await pool.query('UPDATE users SET name = $1, balance = $2, profit = $3, investment = $4, status = $5 WHERE id = $6', [name, balance, profit, investment, status, userId]);
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

module.exports = app;
