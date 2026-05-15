const baseStyles = require('../styles/baseStyles');

function dashboardTemplate(role) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
      ${baseStyles}
      .main-container { max-width: 800px; margin: 0 auto; padding: 1.5rem; padding-bottom: 120px; }
      .hero-stat-card { padding: 2.2rem; margin-bottom: 1.5rem; border: none; background: var(--primary-grad); color: white; box-shadow: 0 20px 40px rgba(230, 126, 34, 0.2); position: relative; overflow: hidden; }
      .hero-stat-card::after { content: ''; position: absolute; top: -50%; right: -50%; width: 100%; height: 100%; background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%); }
      .hero-stat-card h4 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.85; font-weight: 800; }
      .hero-stat-card .val { font-size: 2.8rem; font-weight: 900; margin-top: 0.5rem; letter-spacing: -1px; }
      .sub-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-bottom: 2rem; }
      .sub-stat-card { padding: 1.5rem; text-align: center; }
      .sub-stat-card h4 { font-size: 0.7rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; margin-bottom: 0.4rem; }
      .sub-stat-card .val { font-size: 1.5rem; font-weight: 900; }
      .section-title { font-size: 1.2rem; font-weight: 900; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 10px; }
      .section-title i { color: var(--primary); }
      .plan-item { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; transition: 0.3s; }
      .plan-item:last-child { border-bottom: none; }
      .plan-item:hover { background: #fcfcfc; }
      .ticket-box { background: #f8fafc; border-radius: 20px; padding: 1.5rem; margin-bottom: 1.2rem; border-left: 6px solid var(--primary); animation: fadeIn 0.5s ease-out; }
      .pill { padding: 6px 12px; border-radius: 100px; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
      .pill-pending { background: #fffbeb; color: #b45309; }
      .pill-approved { background: #f0fdf4; color: #15803d; }
      .pill-rejected { background: #fef2f2; color: #b91c1c; }
      .admin-hero { background: #0f172a; color: white; padding: 2.5rem; border-radius: 30px; margin-bottom: 2rem; }
      .admin-stat-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
      .admin-stat-row div { text-align: center; }
      .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--border); }
      .settings-row:last-child { border-bottom: none; }
      .bank-box { background:#f1f5f9; padding:1.5rem; border-radius:20px; margin-bottom:1.5rem; border:2px solid var(--border); }
      @media (max-width: 600px) { .main-container { padding-bottom: 100px; } }
    </style>
  </head>
  <body>
    <div id="snackbar"></div>
    <div id="panelOverlay" class="panel-overlay"></div>

    <header class="sticky-header">
       <div style="display:flex; align-items:center; gap:10px;">
         <i class="fas fa-chart-pie" style="color:var(--primary); font-size:1.6rem; filter: drop-shadow(0 4px 6px rgba(230,126,34,0.3));"></i>
         <h1 id="siteName" style="font-weight:900; font-size:1.3rem; letter-spacing:-0.5px;">...</h1>
       </div>
       <div style="display:flex; align-items:center; gap:12px;">
         <span id="userName" style="font-weight:700; font-size:0.85rem; color:var(--text-muted);">...</span>
         <div style="width:38px; height:38px; background:var(--dark); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:0.9rem;" id="userInitial">?</div>
       </div>
    </header>

    <div class="main-container">
      ${role === 'admin' ? `
        <div class="admin-hero">
          <h3 style="font-weight:900; margin-bottom:1.5rem; font-size:1.4rem;"><i class="fas fa-shield-check" style="color:var(--primary);"></i> Command Center</h3>
          <div class="admin-stat-row" id="adminStats"></div>
        </div>

        <div class="glass-card" style="margin-bottom:2rem; overflow:hidden;">
          <h3 class="section-title" style="padding:1.5rem 1.5rem 0 1.5rem; color:#ef4444;"><i class="fas fa-bolt"></i> Urgent Approvals</h3>
          <div style="overflow-x:auto;"><table class="cpie-table"><tbody id="pendingTxs"></tbody></table></div>
        </div>

        <div class="glass-card" style="margin-bottom:2rem; padding:1.5rem;">
          <h3 class="section-title"><i class="fas fa-cog"></i> Platform Settings</h3>
          <div id="adminSettings"></div>
        </div>

        <div class="glass-card" style="margin-bottom:2rem; padding:1.5rem;">
          <h3 class="section-title"><i class="fas fa-rocket"></i> Investment Plan Control</h3>
          <div id="adminPlanList"></div>
        </div>

        <div class="glass-card" style="margin-bottom:2rem; overflow:hidden;">
          <h3 class="section-title" style="padding:1.5rem 1.5rem 0 1.5rem;"><i class="fas fa-users"></i> Investor Base</h3>
          <div style="overflow-x:auto;"><table class="cpie-table"><thead><tr><th>Investor</th><th>Balance</th><th>Principal</th><th>Action</th></tr></thead><tbody id="adminUserList"></tbody></table></div>
        </div>

        <div class="glass-card" style="margin-bottom:2rem; overflow:hidden;">
          <h3 class="section-title" style="padding:1.5rem 1.5rem 0 1.5rem;"><i class="fas fa-history"></i> Global History</h3>
          <div style="overflow-x:auto;"><table class="cpie-table"><thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead><tbody id="adminGlobalTxList"></tbody></table></div>
          <div style="padding:1rem; text-align:center;"><button class="toggle-link" style="font-size:0.7rem;" onclick="loadMoreHistory()">See More History...</button></div>
        </div>

        <div class="glass-card" style="padding:1.5rem;">
          <h3 class="section-title"><i class="fas fa-headset"></i> Support Queue</h3>
          <div id="adminTicketList"></div>
        </div>
      ` : `
        <div class="hero-stat-card glass-card">
          <h4 id="heroTitle">Net Portfolio Value</h4>
          <div class="val" id="userBalance">$0.00</div>
          <p style="font-size:0.8rem; opacity:0.9; margin-top:0.8rem; font-weight:600;"><i class="fas fa-check-circle"></i> Funds fully secured by Cold Storage</p>
        </div>

        <div class="sub-stat-grid">
          <div class="glass-card sub-stat-card"><h4>Working Capital</h4><div class="val" id="userInv">$0</div></div>
          <div class="glass-card sub-stat-card"><h4>Total Returns</h4><div class="val" id="userProf" style="color:#10b981;">$0</div></div>
        </div>

        <div class="action-grid">
          <div class="action-btn" onclick="openPanel('depositPanel')"><i class="fas fa-plus"></i><span>Deposit</span></div>
          <div class="action-btn" onclick="openPanel('withdrawPanel')"><i class="fas fa-arrow-up"></i><span>Withdraw</span></div>
          <div class="action-btn" onclick="window.scrollTo({top:document.getElementById('plansSect').offsetTop-100, behavior:'smooth'})"><i class="fas fa-rocket"></i><span>Invest</span></div>
          <div class="action-btn" onclick="window.scrollTo({top:document.getElementById('supportSect').offsetTop-100, behavior:'smooth'})"><i class="fas fa-life-ring"></i><span>Support</span></div>
        </div>

        <div id="plansSect" class="glass-card" style="margin-bottom:2rem; overflow:hidden;">
          <h3 class="section-title" style="padding:1.8rem 1.8rem 0.5rem 1.8rem;"><i class="fas fa-star"></i> Investment Tiers</h3>
          <div id="userPlanList"></div>
        </div>

        <div class="glass-card" style="margin-bottom:2rem; padding:1.5rem; background:#f8fafc; border:1px dashed var(--primary);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div><p style="font-size:0.7rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Your Referral Code</p><h3 id="userRefCode" style="font-weight:900; font-size:1.2rem; color:var(--primary);">...</h3></div>
            <button class="btn-grad" style="padding:8px 16px; font-size:0.75rem;" onclick="copyText('userRefCode', 'Referral code')">Copy Code <i class="fas fa-copy"></i></button>
          </div>
        </div>

        <div class="glass-card" style="margin-bottom:2rem; overflow:hidden;">
          <h3 class="section-title" style="padding:1.8rem 1.8rem 0.5rem 1.8rem;"><i class="fas fa-history"></i> Recent Activity</h3>
          <div style="overflow-x:auto;"><table class="cpie-table"><tbody id="userTxList"></tbody></table></div>
        </div>

        <div id="supportSect" class="glass-card" style="padding:2rem;">
          <h3 class="section-title" style="margin-bottom:1rem;"><i class="fas fa-comments"></i> Support Center</h3>
          <div style="display:flex; gap:10px; margin-bottom:2rem;" id="supportLinks"></div>
          <div id="userTicketList"></div>
          <div style="margin-top:2rem;">
            <input type="text" id="ticketSub" class="panel-input" placeholder="Subject">
            <textarea id="ticketMsg" class="panel-input" style="height:100px; resize:none;" placeholder="How can we help?"></textarea>
            <button class="btn-grad" style="width:100%;" onclick="createTicket()">Open Support Ticket <i class="fas fa-paper-plane"></i></button>
          </div>
        </div>
      `}
    </div>

    <nav class="sticky-footer">
      <a class="footer-item active" onclick="window.scrollTo({top:0,behavior:'smooth'})"><i class="fas fa-home"></i><span>Home</span></a>
      ${role === 'user' ? `
        <a class="footer-item" onclick="openPanel('depositPanel')"><i class="fas fa-wallet"></i><span>Deposit</span></a>
        <a class="footer-item" onclick="openPanel('withdrawPanel')"><i class="fas fa-paper-plane"></i><span>Payout</span></a>
      ` : ''}
      <a class="footer-item" onclick="handleLogout()"><i class="fas fa-sign-out-alt"></i><span>Exit</span></a>
    </nav>

    <!-- Panels -->
    <div id="depositPanel" class="slide-panel">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h2 style="font-weight:900;">Add Funds</h2>
        <button onclick="closePanel()" style="background:none; border:none; font-size:1.5rem; cursor:pointer;"><i class="fas fa-times"></i></button>
      </div>
      <div id="cryptoList"></div>
      <p style="color:var(--text-muted); font-weight:600; margin-bottom:1.5rem; font-size:0.8rem;">Send crypto to the address above, then enter the USD equivalent sent below.</p>
      <input type="number" id="depAmt" class="panel-input" placeholder="Amount in USD">
      <button class="btn-grad" style="width:100%;" onclick="submitTx('deposit', 'depAmt')">Confirm Notification <i class="fas fa-check"></i></button>
    </div>

    <div id="withdrawPanel" class="slide-panel">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h2 style="font-weight:900;">Withdraw</h2>
        <button onclick="closePanel()" style="background:none; border:none; font-size:1.5rem; cursor:pointer;"><i class="fas fa-times"></i></button>
      </div>
      <div class="bank-box" id="bankInfoBox">...</div>
      <p id="wdInfo" style="color:var(--text-muted); font-weight:600; margin-bottom:2rem; font-size:0.85rem;">...</p>
      <input type="number" id="wdAmt" class="panel-input" placeholder="Amount in USD">
      <button class="btn-grad" style="width:100%; background:var(--dark);" onclick="submitTx('withdraw', 'wdAmt')">Request Payout <i class="fas fa-arrow-right"></i></button>
    </div>

    <div id="editUserPanel" class="slide-panel">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h2 style="font-weight:900;">Edit Investor</h2>
        <button onclick="closePanel()" style="background:none; border:none; font-size:1.5rem; cursor:pointer;"><i class="fas fa-times"></i></button>
      </div>
      <input type="hidden" id="editUserId">
      <div class="input-group"><label>Full Name</label><input type="text" id="editUserName" class="panel-input"></div>
      <div class="input-group"><label>New Password (Leave blank to keep same)</label><input type="text" id="editUserPass" class="panel-input" placeholder="••••••••"></div>
      <div class="input-group"><label>Balance ($)</label><input type="number" id="editUserBal" class="panel-input"></div>
      <div class="input-group"><label>Profit ($)</label><input type="number" id="editUserProf" class="panel-input"></div>
      <div class="input-group"><label>Principal ($)</label><input type="number" id="editUserInv" class="panel-input"></div>
      <div class="input-group"><label>Account Status</label><select id="editUserStatus" class="panel-input"><option value="Active">Active</option><option value="Suspended">Suspended</option></select></div>
      <button class="btn-grad" style="width:100%;" onclick="saveUserEdit()">Save Changes <i class="fas fa-save"></i></button>
      <button class="btn-grad" style="width:100%; margin-top:10px; background:#ef4444;" onclick="deleteUser()">Delete Account <i class="fas fa-trash"></i></button>
    </div>

    <script>
      let historyLimit = 50;

      function showSnackbar(msg, type) {
        const sb = document.getElementById("snackbar");
        sb.innerHTML = \`<i class="fas \${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> \${msg}\`;
        sb.className = "show " + (type || "");
        setTimeout(() => { sb.className = ""; }, 3000);
      }
      function openPanel(id) { document.getElementById(id).classList.add('active'); document.getElementById('panelOverlay').classList.add('active'); }
      function closePanel() { document.querySelectorAll('.slide-panel').forEach(p => p.classList.remove('active')); document.getElementById('panelOverlay').classList.remove('active'); }
      document.getElementById('panelOverlay').onclick = closePanel;

      function copyText(id, label) {
        const el = document.getElementById(id);
        const text = el.innerText || el.value;
        navigator.clipboard.writeText(text);
        showSnackbar(\`\${label} copied!\`, "success");
      }

      async function handleLogout() { await fetch('/api/logout', { method:'POST' }); window.location.reload(); }

      async function submitTx(type, inputId) {
        const amount = document.getElementById(inputId).value;
        if(!amount || amount <= 0) return showSnackbar("Invalid amount", "error");
        const res = await fetch(\`/api/\${type}\`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ amount:parseFloat(amount) }) });
        const data = await res.json();
        if(data.success) { 
          showSnackbar(data.message, "success"); 
          if(type === 'withdraw') showSnackbar("Funds locked until approval/rejection", "success");
          closePanel(); loadData(); 
        }
        else showSnackbar(data.message, "error");
      }

      async function buyPlan(planId, amount) {
        if(!confirm(\`Invest $\${parseFloat(amount).toLocaleString()} into this plan?\`)) return;
        const res = await fetch('/api/plan/buy', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ planId, amount:parseFloat(amount) }) });
        const data = await res.json();
        if(data.success) { showSnackbar(data.message, "success"); loadData(); }
        else showSnackbar(data.message, "error");
      }

      async function createTicket() {
        const subject = document.getElementById('ticketSub').value;
        const message = document.getElementById('ticketMsg').value;
        if(!subject || !message) return showSnackbar("Required fields empty", "error");
        const res = await fetch('/api/ticket/create', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ subject, message }) });
        const data = await res.json();
        if(data.success) { showSnackbar("Ticket sent", "success"); loadData(); }
      }

      async function processRequest(txId, action) {
        let reason = null;
        if(action === 'Rejected') {
          reason = prompt("Reason for rejection:");
          if(!reason) return;
        }
        const res = await fetch('/api/admin/tx/process', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ txId, action, reason }) });
        const data = await res.json(); if(data.success) loadData();
      }

      async function updateSetting(key, value) {
        const res = await fetch('/api/admin/settings/update', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ key, value }) });
        const data = await res.json(); if(data.success) { showSnackbar("Updated", "success"); loadData(); }
      }

      async function updatePlan(id) {
        const name = prompt("Plan Name:"); if(!name) return;
        const min_amount = prompt("Min Amount ($):"); if(!min_amount) return;
        const roi = prompt("ROI (%):"); if(!roi) return;
        const days = prompt("Days:"); if(!days) return;
        const body = { id, name, min_amount:parseFloat(min_amount), roi:parseFloat(roi), days:parseInt(days) };
        const res = await fetch('/api/admin/plans/update', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
        const data = await res.json(); if(data.success) { showSnackbar("Plan updated", "success"); loadData(); }
      }

      function openEditUser(id, name, bal, prof, inv, status) {
        document.getElementById('editUserId').value = id;
        document.getElementById('editUserName').value = name;
        document.getElementById('editUserPass').value = '';
        document.getElementById('editUserBal').value = bal;
        document.getElementById('editUserProf').value = prof;
        document.getElementById('editUserInv').value = inv;
        document.getElementById('editUserStatus').value = status;
        openPanel('editUserPanel');
      }

      async function saveUserEdit() {
        const body = {
          userId: document.getElementById('editUserId').value,
          name: document.getElementById('editUserName').value,
          password: document.getElementById('editUserPass').value,
          balance: parseFloat(document.getElementById('editUserBal').value),
          profit: parseFloat(document.getElementById('editUserProf').value),
          investment: parseFloat(document.getElementById('editUserInv').value),
          status: document.getElementById('editUserStatus').value
        };
        const res = await fetch('/api/admin/user/update', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
        const data = await res.json();
        if(data.success) { showSnackbar("User updated", "success"); closePanel(); loadData(); }
      }

      async function deleteUser() {
        if(!confirm("Are you sure? This action is permanent.")) return;
        const userId = document.getElementById('editUserId').value;
        const res = await fetch('/api/admin/user/delete', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ userId }) });
        const data = await res.json();
        if(data.success) { showSnackbar("User deleted", "success"); closePanel(); loadData(); }
      }

      async function replyTicket(ticketId) {
        const reply = prompt("Reply:"); if(!reply) return;
        const res = await fetch('/api/admin/ticket/reply', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ticketId, reply }) });
        const data = await res.json(); if(data.success) loadData();
      }

      function loadMoreHistory() {
        historyLimit += 50;
        loadData();
      }

      async function loadData() {
        try {
          if('${role}' === 'admin') {
            const res = await fetch(\`/api/admin/data?limit=\${historyLimit}\`);
            const data = await res.json();
            document.getElementById('adminStats').innerHTML = \`
              <div><p style="opacity:0.6; font-size:0.6rem; font-weight:900;">LIQUIDITY</p><div style="font-size:1.5rem; font-weight:900;">$\${data.stats.totalBal.toLocaleString()}</div></div>
              <div><p style="opacity:0.6; font-size:0.6rem; font-weight:900;">PRINCIPAL</p><div style="font-size:1.5rem; font-weight:900;">$\${data.stats.totalInv.toLocaleString()}</div></div>
              <div><p style="opacity:0.6; font-size:0.6rem; font-weight:900;">USERS</p><div style="font-size:1.5rem; font-weight:900;">\${data.stats.users}</div></div>
            \`;
            const pendingTbody = document.getElementById('pendingTxs'); pendingTbody.innerHTML = '';
            data.pending.forEach(tx => {
              pendingTbody.innerHTML += \`<tr><td><strong>\${tx.userName}</strong><br><small>\${tx.type}</small></td><td style="color:var(--primary); font-weight:900;">$\${parseFloat(tx.amount).toLocaleString()}</td><td><div style="display:flex; gap:5px;"><button class="btn-grad" style="padding:6px 10px; font-size:0.6rem;" onclick="processRequest('\${tx.id}', 'Approved')">OK</button><button class="btn-grad" style="padding:6px 10px; font-size:0.6rem; background:#ef4444;" onclick="processRequest('\${tx.id}', 'Rejected')">REJ</button></div></td></tr>\`;
            });
            const settingsDiv = document.getElementById('adminSettings'); settingsDiv.innerHTML = '';
            data.settings.forEach(s => {
              settingsDiv.innerHTML += \`<div class="settings-row"><div><strong>\${s.key_name.toUpperCase()}</strong><br><small style="color:var(--text-muted);">\${s.value}</small></div><button class="btn-grad" style="padding:6px 12px; font-size:0.65rem;" onclick="const v=prompt('New value:', '\${s.value}'); if(v) updateSetting('\${s.key_name}', v)">EDIT</button></div>\`;
            });
            const planDiv = document.getElementById('adminPlanList'); planDiv.innerHTML = '';
            data.plans.forEach(p => {
              planDiv.innerHTML += \`<div class="settings-row"><div><strong>\${p.name}</strong><br><small style="color:var(--text-muted);">Min: $\${p.min_amount} | \${p.roi}% | \${p.days}d</small></div><button class="btn-grad" style="padding:6px 12px; font-size:0.65rem;" onclick="updatePlan('\${p.id}')">EDIT</button></div>\`;
            });
            const userTbody = document.getElementById('adminUserList'); userTbody.innerHTML = '';
            data.users.forEach(u => {
              userTbody.innerHTML += \`<tr><td><strong>\${u.name} \${u.role === 'admin' ? '<span class="pill pill-approved" style="font-size:0.5rem;">ADMIN</span>' : ''}</strong><br><small>\${u.username}</small></td><td>$\${parseFloat(u.balance).toLocaleString()}</td><td>$\${parseFloat(u.investment).toLocaleString()}</td><td><button onclick="openEditUser('\${u.id}','\${u.name}',\${u.balance},\${u.profit},\${u.investment},'\${u.status}')" style="border:none; background:none; color:var(--primary); font-size:1.2rem; cursor:pointer;"><i class="fas fa-edit"></i></button></td></tr>\`;
            });
            const globalHistTbody = document.getElementById('adminGlobalTxList'); globalHistTbody.innerHTML = '';
            if(data.globalHistory) {
              data.globalHistory.forEach(tx => {
                globalHistTbody.innerHTML += \`<tr><td><strong>\${tx.userName}</strong></td><td>\${tx.type}</td><td style="font-weight:900;">$\${parseFloat(tx.amount).toLocaleString()}</td><td><span class="pill \${tx.status === 'Approved' ? 'pill-approved' : tx.status === 'Pending' ? 'pill-pending' : 'pill-rejected'}">\${tx.status}</span></td></tr>\`;
              });
            }
            const ticketDiv = document.getElementById('adminTicketList'); ticketDiv.innerHTML = '';
            data.tickets.forEach(tk => {
              ticketDiv.innerHTML += \`<div class="ticket-box"><strong>\${tk.userName}</strong>: \${tk.subject}<br><small>\${tk.message}</small><br>\${tk.reply ? \`<div style="background:white; padding:10px; border-radius:12px; margin-top:10px; font-size:0.8rem; border:1px solid #eee;"><strong>Your Reply:</strong> \${tk.reply}</div>\` : \`<button class="btn-grad" style="padding:6px 12px; font-size:0.65rem; margin-top:8px;" onclick="replyTicket('\${tk.id}')">REPLY</button>\`}</div>\`;
            });
          } else {
            const res = await fetch('/api/user/data');
            const data = await res.json();
            document.getElementById('siteName').innerText = data.settings.platform_name;
            document.getElementById('userName').innerText = data.user.name;
            document.getElementById('userInitial').innerText = data.user.name.charAt(0);
            document.getElementById('userBalance').innerText = '$' + data.user.balance.toLocaleString();
            document.getElementById('userInv').innerText = '$' + data.user.investment.toLocaleString();
            document.getElementById('userProf').innerText = '$' + data.user.profit.toLocaleString();
            document.getElementById('userRefCode').innerText = data.user.referral_code;
            document.getElementById('wdInfo').innerText = \`Min: $\${data.settings.min_withdrawal} • Fee: \${data.settings.withdrawal_fee_percent}%\`;
            
            document.getElementById('bankInfoBox').innerHTML = \`
              <p style="font-size:0.65rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Bank Payout Details</p>
              <h3 style="font-weight:900; margin:0.5rem 0;">\${data.settings.bank_name}</h3>
              <p style="font-size:0.85rem; font-weight:700;">Account: \${data.settings.account_name}</p>
              <p style="font-size:0.85rem; font-weight:700;">Number: \${data.settings.account_number}</p>
            \`;

            const cryptoList = document.getElementById('cryptoList'); cryptoList.innerHTML = \`
              <div class="crypto-box"><p style="font-size:0.65rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">BITCOIN (BTC) ADDRESS</p><div style="display:flex; align-items:center; gap:10px;"><code id="btc_addr" style="font-size:0.7rem; word-break:break-all; font-weight:700;">\${data.settings.btc_address}</code><button onclick="copyText('btc_addr', 'BTC Address')" style="background:var(--dark); color:white; border:none; padding:6px; border-radius:8px; cursor:pointer; font-size:0.7rem;"><i class="fas fa-copy"></i></button></div></div>
            \`;

            const userPlanList = document.getElementById('userPlanList'); userPlanList.innerHTML = '';
            data.plans.forEach(p => {
              userPlanList.innerHTML += \`<div class="plan-item"><div><strong>\${p.name}</strong><p style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">\${p.roi}% Return • \${p.days} Days</p></div><button class="btn-grad" style="padding:10px 20px; font-size:0.8rem;" onclick="const a=prompt('Amount to Invest (Min $\${p.min_amount}):', '\${p.min_amount}'); if(a) buyPlan('\${p.id}', a)">Invest $\${parseFloat(p.min_amount).toLocaleString()}+</button></div>\`;
            });

            const supportLinks = document.getElementById('supportLinks'); supportLinks.innerHTML = \`
              <a href="\${data.settings.telegram_link}" class="btn-grad no-underline" style="flex:1; padding:10px; font-size:0.7rem; background:#229ED9;"><i class="fab fa-telegram"></i> Telegram</a>
              <a href="\${data.settings.whatsapp_link}" class="btn-grad no-underline" style="flex:1; padding:10px; font-size:0.7rem; background:#25D366;"><i class="fab fa-whatsapp"></i> WhatsApp</a>
            \`;
            const histTbody = document.getElementById('userTxList'); histTbody.innerHTML = '';
            data.transactions.forEach(tx => {
              const pill = tx.status === 'Pending' ? 'pill-pending' : tx.status === 'Approved' ? 'pill-approved' : 'pill-rejected';
              histTbody.innerHTML += \`<tr><td><strong>\${tx.type}</strong><br><small>\${new Date(tx.created_at).toLocaleDateString()}</small>\${tx.rejection_reason ? \`<br><small style="color:#ef4444;">Reason: \${tx.rejection_reason}</small>\` : ''}</td><td style="font-weight:900;">$\${parseFloat(tx.amount).toLocaleString()}</td><td><span class="pill \${pill}">\${tx.status}</span></td></tr>\`;
            });
            const uTicketDiv = document.getElementById('userTicketList'); uTicketDiv.innerHTML = '';
            data.tickets.forEach(tk => {
              uTicketDiv.innerHTML += \`<div class="ticket-box"><strong>\${tk.subject}</strong> <span class="pill \${tk.status === 'Open' ? 'pill-pending' : 'pill-approved'}">\${tk.status}</span><br><small>\${tk.message}</small>\${tk.reply ? \`<div style="background:white; padding:10px; border-radius:12px; margin-top:10px; font-size:0.8rem; border:1px solid #eee;"><strong>Admin:</strong> \${tk.reply}</div>\` : ''}</div>\`;
            });
          }
        } catch(e) { console.error(e); }
      }
      loadData();
    </script>
  </body></html>`;
}

module.exports = dashboardTemplate;
