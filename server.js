const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory database
const userPortfolios = {
  'Becky Stough': { investment: 5000, profit: 500, balance: 5500, status: 'Active' },
  'Michael Chen': { investment: 12400, profit: 1240, balance: 13640, status: 'Active' },
  'Sarah Johnson': { investment: 8200, profit: 820, balance: 9020, status: 'Active' },
  'David Kim': { investment: 22000, profit: 2200, balance: 24200, status: 'Active' }
};

// API endpoints
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'Becky_tesla' && password === 'Tesla2026') {
    res.json({ success: true, role: 'user' });
  } else if (username === 'admin' && password === 'pass123') {
    res.json({ success: true, role: 'admin' });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/admin/data', (req, res) => {
  res.json({
    totalInvestors: 1284,
    totalAUM: 6.42,
    avgROI: 10.2,
    activeSessions: 347,
    tslaData: [245, 258, 272, 268, 290, 305, 327],
    allocation: [78, 15, 7],
    portfolios: userPortfolios
  });
});

app.get('/api/user/data', (req, res) => {
  res.json({
    userName: 'Becky Stough',
    investment: 5000,
    profit: 500,
    balance: 5500,
    roi: 10.00,
    shares: 15.3,
    avgPrice: 359
  });
});

// Serve HTML - using readFileSync or just include as string properly escaped
const fs = require('fs');
const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tesla Investment</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f0f2f8; font-family: 'Inter', sans-serif; min-height: 100vh; display: flex; flex-direction: column; }
    .hero-header { text-align: center; padding: 2rem 1rem 1.5rem 1rem; background: #f0f2f8; }
    .floating-title { display: inline-flex; align-items: center; gap: 14px; background: white; padding: 0.7rem 1.8rem; border-radius: 100px; box-shadow: 0 12px 28px -10px rgba(0,0,0,0.12); border: 1px solid #e9edf4; }
    .floating-title i { font-size: 1.8rem; color: #e82127; }
    .floating-title h1 { font-size: 1.7rem; font-weight: 800; color: #0a2a3b; }
    .sticky-nav { position: fixed; top: 0; left: 0; width: 100%; background: #f0f2f8; z-index: 1000; transform: translateY(-100%); transition: transform 0.3s; padding: 0.7rem 1rem; }
    .sticky-nav.visible { transform: translateY(0); box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
    .sticky-inner { max-width: 860px; margin: 0 auto; display: flex; justify-content: center; }
    .sticky-title { display: inline-flex; align-items: center; gap: 12px; background: white; padding: 0.4rem 1.5rem; border-radius: 60px; border: 1px solid #e2e8f0; }
    .main-container { max-width: 860px; margin: 0 auto; padding: 0 1rem 1rem 1rem; flex: 1; }
    .user-card { background: white; border-radius: 32px; padding: 1.2rem 1.5rem; margin: 1rem 0 1.5rem 0; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; border: 1px solid #eef2f8; }
    .user-avatar { display: flex; align-items: center; gap: 14px; }
    .avatar-icon { background: #1e3a4d; width: 48px; height: 48px; border-radius: 50px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; }
    .date-badge { background: #eef3fc; padding: 6px 14px; border-radius: 40px; font-size: 0.7rem; font-family: monospace; }
    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 1rem; margin-bottom: 1.8rem; }
    .stat-card { background: white; border-radius: 28px; padding: 1.2rem; border: 1px solid #edf2f7; }
    .stat-number { font-size: 2.1rem; font-weight: 800; color: #102b39; }
    .profit-chip { background: #e6f7ed; color: #1e9b4a; padding: 2px 8px; border-radius: 40px; font-size: 0.65rem; display: inline-block; }
    .tesla-detail, .activity-log { background: white; border-radius: 32px; padding: 1.4rem 1.5rem; margin-bottom: 1.5rem; border: 1px solid #ecf3f9; }
    .section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 1.2rem; border-left: 4px solid #e82127; padding-left: 1rem; }
    .green-txt { color: #1a9b4a; font-weight: 800; }
    .site-footer { background: white; border-top: 1px solid #e4ecf3; padding: 1rem; position: sticky; bottom: 0; width: 100%; z-index: 999; margin-top: 1.5rem; }
    .footer-content { max-width: 860px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
    .footer-link { background: none; border: none; font-size: 0.75rem; color: #5f8bb0; cursor: pointer; }
    .footer-link:hover { color: #e82127; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; visibility: hidden; opacity: 0; transition: 0.2s; }
    .modal-overlay.active { visibility: visible; opacity: 1; }
    .modal-container { background: white; border-radius: 32px; max-width: 480px; width: 90%; padding: 1.8rem; }
    .login-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); z-index: 5000; display: flex; align-items: center; justify-content: center; visibility: visible; opacity: 1; transition: 0.2s; }
    .login-overlay.hidden { visibility: hidden; opacity: 0; pointer-events: none; }
    .login-card { background: white; border-radius: 48px; padding: 2rem; width: 90%; max-width: 400px; text-align: center; }
    .login-card input { width: 100%; padding: 14px 18px; margin: 12px 0; border: 2px solid #e2e8f0; border-radius: 60px; }
    .login-card button { background: #e82127; color: white; border: none; padding: 14px; width: 100%; border-radius: 60px; cursor: pointer; }
    .admin-dashboard { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #0a111a; z-index: 4000; overflow-y: auto; }
    .admin-dashboard.active { display: block; }
    .client-view.hide-client { display: none; }
    .admin-wrapper { max-width: 1400px; margin: 0 auto; padding: 1.5rem; }
    .admin-header { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 1rem 2rem; border-radius: 40px; margin-bottom: 2rem; }
    .admin-header h2 { color: white; display: flex; align-items: center; gap: 12px; }
    .logout-btn { background: #e82127; border: none; padding: 10px 28px; border-radius: 40px; color: white; cursor: pointer; }
    .dashboard-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .admin-stat-card { background: #111c2a; border-radius: 28px; padding: 1.5rem; }
    .admin-stat-card .value { font-size: 2.2rem; font-weight: 800; color: white; }
    .chart-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.8rem; margin-bottom: 2rem; }
    .chart-card { background: #111c2a; border-radius: 28px; padding: 1.2rem; }
    .user-table { background: #111c2a; border-radius: 28px; padding: 1.2rem; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; color: #ddd; }
    th, td { padding: 12px 8px; text-align: left; border-bottom: 1px solid #1e2f3f; }
    .badge-active { background: #1e9b4a; padding: 4px 10px; border-radius: 40px; font-size: 0.7rem; }
    @media (max-width: 560px) { .stat-number { font-size: 1.5rem; } .footer-content { flex-direction: column; } .chart-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>

<div id="loginOverlay" class="login-overlay">
  <div class="login-card">
    <i class="fab fa-tesla" style="font-size: 3rem; color:#e82127;"></i>
    <h2>Tesla Investment</h2>
    <p style="color:#5f7d98;">Sign in to your account</p>
    <input type="text" id="loginUsername" placeholder="Username">
    <input type="password" id="loginPassword" placeholder="Password">
    <button id="loginBtn">Login</button>
    <div id="loginErrorMessage" class="login-error"></div>
  </div>
</div>

<div id="clientView" class="client-view hide-client">
  <div class="hero-header"><div class="floating-title"><i class="fab fa-tesla"></i><h1>Tesla Investment</h1></div></div>
  <div class="sticky-nav" id="stickyHeaderBar"><div class="sticky-inner"><div class="sticky-title"><i class="fab fa-tesla"></i><span>Tesla Investment</span></div></div></div>
  <div class="main-container">
    <div class="user-card"><div class="user-avatar"><div class="avatar-icon">BS</div><div class="user-text"><h3 id="userName">Becky Stough</h3><p><i class="fas fa-check-circle" style="color:#1e9b4a;"></i> Verified account</p></div></div><div class="date-badge" id="realTimeClock"><i class="far fa-calendar-alt"></i> <span id="clockDisplay">--</span></div></div>
    <div class="stats-row"><div class="stat-card"><div class="stat-title">TOTAL INVESTMENT</div><div class="stat-number" id="totalInvestment">$5,000</div></div><div class="stat-card"><div class="stat-title">TOTAL PROFIT</div><div class="stat-number" id="totalProfit">$500</div></div><div class="stat-card"><div class="stat-title">CURRENT BALANCE</div><div class="stat-number" id="currentBalance">$5,500</div></div></div>
    <div class="tesla-detail"><div class="section-head"><i class="fab fa-tesla"></i><h3>Tesla position details</h3></div><div class="details-list"><div class="detail-row"><span class="detail-label">Total investment</span><span id="detailInvestment"><strong>$5,000</strong></span></div><div class="detail-row"><span class="detail-label">Market value</span><span class="green-txt" id="detailValue">$5,500</span></div><div class="detail-row"><span class="detail-label">Unrealized profit</span><span class="green-txt" id="detailProfit">+$500</span></div><div class="detail-row"><span class="detail-label">ROI</span><span class="green-txt" id="detailROI">+10.00%</span></div></div></div>
    <div class="activity-log"><div class="activity-header"><span>Recent activity</span><button class="refresh-btn" id="refreshBtn">Refresh</button></div><div id="activityItems"></div><div id="liveTimestamp" style="font-size:0.6rem; text-align:right;"></div></div>
  </div>
  <footer class="site-footer"><div class="footer-content"><div class="footer-links"><button class="footer-link" id="faqBtn">FAQs</button><button class="footer-link" id="careBtn">Customer Care</button></div><div class="copyright">© 2026 Tesla Investment</div></div></footer>
</div>

<div id="adminDashboard" class="admin-dashboard"><div class="admin-wrapper"><div class="admin-header"><h2><i class="fab fa-tesla" style="color:#e82127;"></i> Admin Console</h2><button class="logout-btn" id="logoutAdminBtn">Exit Admin</button></div><div class="dashboard-stats" id="adminStats"></div><div class="chart-grid"><div class="chart-card"><canvas id="tslaChart"></canvas></div><div class="chart-card"><canvas id="allocationChart"></canvas></div></div><div class="user-table"><table id="adminUserTable"><thead><tr><th>Investor</th><th>Investment</th><th>Profit</th><th>Balance</th><th>Status</th></tr></thead><tbody id="adminTableBody"></tbody></table></div></div></div>

<div id="faqModal" class="modal-overlay"><div class="modal-container"><div class="modal-header"><h3>FAQs</h3><button class="close-modal" data-modal="faqModal">×</button></div><div class="faq-item"><div class="faq-question">How do I add funds?</div><div class="faq-answer">Bank transfer or card options are available.</div></div><div class="faq-item"><div class="faq-question">Is my investment protected?</div><div class="faq-answer">Yes, fully insured and segregated.</div></div><div class="faq-item"><div class="faq-question">How are profits calculated?</div><div class="faq-answer">Real-time TSLA market performance.</div></div><div class="faq-item"><div class="faq-question">Can I withdraw anytime?</div><div class="faq-answer">Yes, 1-3 business days.</div></div></div></div>

<div id="careModal" class="modal-overlay"><div class="modal-container"><div class="modal-header"><h3>Customer Care</h3><button class="close-modal" data-modal="careModal">×</button></div><div class="customer-care-info"><div class="care-option"><i class="fas fa-envelope"></i><span>support@teslainvestment.com</span></div><div class="care-option"><i class="fas fa-phone-alt"></i><span>+1 (888) 555-0123</span></div><div class="care-option"><i class="fas fa-comment-dots"></i><span>Live chat: 9AM - 6PM EST</span></div><div class="care-option"><i class="fas fa-clock"></i><span>24/7 support</span></div></div></div></div>

<script>
function updateRealTimeClock(){const now=new Date();const options={year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true};const span=document.getElementById('clockDisplay');if(span)span.textContent=now.toLocaleString('en-US',options);}
updateRealTimeClock();setInterval(updateRealTimeClock,1000);
const stickyBar=document.getElementById('stickyHeaderBar');const floatingHeader=document.querySelector('.hero-header');
function updateSticky(){if(floatingHeader && floatingHeader.getBoundingClientRect().bottom<=0)stickyBar.classList.add('visible');else stickyBar.classList.remove('visible');}
window.addEventListener('scroll',updateSticky);updateSticky();
function openModal(id){document.getElementById(id)?.classList.add('active');}
function closeModal(id){document.getElementById(id)?.classList.remove('active');}
document.getElementById('faqBtn')?.addEventListener('click',()=>openModal('faqModal'));
document.getElementById('careBtn')?.addEventListener('click',()=>openModal('careModal'));
document.querySelectorAll('.close-modal').forEach(btn=>{btn.addEventListener('click',()=>closeModal(btn.getAttribute('data-modal')));});
document.querySelectorAll('.modal-overlay').forEach(overlay=>{overlay.addEventListener('click',(e)=>{if(e.target===overlay)overlay.classList.remove('active');});});
let tslaChart,allocationChart;
async function loadAdminData(){try{const res=await fetch('/api/admin/data');const data=await res.json();document.getElementById('adminStats').innerHTML='<div class="admin-stat-card"><h4>Total Investors</h4><div class="value">'+data.totalInvestors.toLocaleString()+'</div></div><div class="admin-stat-card"><h4>Total AUM</h4><div class="value">$'+data.totalAUM+'M</div></div><div class="admin-stat-card"><h4>Avg ROI</h4><div class="value">+'+data.avgROI+'%</div></div><div class="admin-stat-card"><h4>Active Sessions</h4><div class="value">'+data.activeSessions.toLocaleString()+'</div></div>';const tbody=document.getElementById('adminTableBody');tbody.innerHTML='';for(const[name,portfolio]of Object.entries(data.portfolios)){tbody.innerHTML+='<tr><td>'+name+'</td><td>$'+portfolio.investment.toLocaleString()+'</td><td class="green-txt">+$'+portfolio.profit.toLocaleString()+'</td><td>$'+portfolio.balance.toLocaleString()+'</td><td><span class="badge-active">'+portfolio.status+'</span></td></tr>';}
const tslaCtx=document.getElementById('tslaChart')?.getContext('2d');const allocCtx=document.getElementById('allocationChart')?.getContext('2d');if(tslaCtx){if(tslaChart)tslaChart.destroy();tslaChart=new Chart(tslaCtx,{type:'line',data:{labels:['Apr1','Apr5','Apr10','Apr15','Apr20','Apr25','Today'],datasets:[{label:'TSLA Price',data:data.tslaData,borderColor:'#e82127',tension:0.3,fill:true}]},options:{responsive:true}});}
if(allocCtx){if(allocationChart)allocationChart.destroy();allocationChart=new Chart(allocCtx,{type:'doughnut',data:{labels:['Tesla','Cash','Bonds'],datasets:[{data:data.allocation,backgroundColor:['#e82127','#2c6e9e','#f5b042']}]},options:{responsive:true}});}}catch(e){console.error(e);}}
async function loadUserData(){try{const res=await fetch('/api/user/data');const data=await res.json();document.getElementById('totalInvestment').innerText='$'+data.investment.toLocaleString();document.getElementById('totalProfit').innerText='$'+data.profit.toLocaleString();document.getElementById('currentBalance').innerText='$'+data.balance.toLocaleString();document.getElementById('detailInvestment').innerHTML='<strong>$'+data.investment.toFixed(2)+'</strong>';document.getElementById('detailValue').innerText='$'+data.balance.toFixed(2);document.getElementById('detailProfit').innerText='+$'+data.profit.toFixed(2);document.getElementById('detailROI').innerText='+'+data.roi.toFixed(2)+'%';document.getElementById('activityItems').innerHTML='<div class="activity-item"><div><i class="fas fa-plus-circle" style="color:#1e9b4a;"></i> <strong>Initial deposit</strong><br><span style="font-size:0.65rem;">Today</span></div><div class="green-txt">+$5,000</div></div><div class="activity-item"><div><i class="fas fa-chart-line"></i> <strong>Market appreciation</strong><br><span style="font-size:0.65rem;">+10% gain</span></div><div class="green-txt">+$500</div></div><div class="activity-item"><div><i class="fas fa-charging-station"></i> <strong>Current TSLA shares</strong><br><span style="font-size:0.65rem;">~15.3 shares</span></div><div><strong>$5,500</strong></div></div>';}catch(e){console.error(e);}}
const refreshBtn=document.getElementById('refreshBtn');const timestampDiv=document.getElementById('liveTimestamp');
function updateTimestamp(){const now=new Date();timestampDiv.innerHTML='<i class="far fa-clock"></i> Last update: '+now.toLocaleTimeString();loadUserData();}
refreshBtn?.addEventListener('click',updateTimestamp);setInterval(()=>{if(timestampDiv)timestampDiv.innerHTML='<i class="far fa-clock"></i> Last update: '+new Date().toLocaleTimeString();},60000);
const loginOverlay=document.getElementById('loginOverlay');const clientViewDiv=document.getElementById('clientView');const adminDashboardDiv=document.getElementById('adminDashboard');
async function showClientDashboard(){clientViewDiv.classList.remove('hide-client');adminDashboardDiv.classList.remove('active');loginOverlay.classList.add('hidden');document.body.style.background="#f0f2f8";await loadUserData();updateTimestamp();}
async function showAdminDashboard(){clientViewDiv.classList.add('hide-client');adminDashboardDiv.classList.add('active');loginOverlay.classList.add('hidden');document.body.style.background="#0a111a";await loadAdminData();}
document.getElementById('loginBtn').addEventListener('click',async()=>{const username=document.getElementById('loginUsername').value.trim();const password=document.getElementById('loginPassword').value.trim();const res=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});const data=await res.json();if(data.success){if(data.role==='admin')await showAdminDashboard();else await showClientDashboard();}else{document.getElementById('loginErrorMessage').innerText=data.message;}});
document.getElementById('logoutAdminBtn')?.addEventListener('click',()=>{loginOverlay.classList.remove('hidden');clientViewDiv.classList.add('hide-client');adminDashboardDiv.classList.remove('active');});
document.addEventListener('keydown',(e)=>{if(e.ctrlKey&&e.shiftKey&&e.key==='A'){e.preventDefault();loginOverlay.classList.remove('hidden');clientViewDiv.classList.add('hide-client');adminDashboardDiv.classList.remove('active');}});
</script>
</body>
</html>`;

app.get('/', (req, res) => {
  res.send(htmlTemplate);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
