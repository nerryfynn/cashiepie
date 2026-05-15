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
      .hero-stat-card .val { font-size: clamp(1.8rem, 8vw, 2.8rem); font-weight: 900; margin-top: 0.5rem; letter-spacing: -1px; white-space: nowrap; overflow: hidden; }
      .sub-stat-card { padding: 1.5rem; text-align: center; overflow: hidden; }
      .sub-stat-card .val { font-size: clamp(1rem, 5vw, 1.5rem); font-weight: 900; white-space: nowrap; overflow: hidden; }
      
      .pill { padding: 6px 12px; border-radius: 100px; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
      .pill-pending { background: #fffbeb; color: #b45309; }
      .pill-approved { background: #f0fdf4; color: #15803d; }
      .pill-rejected { background: #fef2f2; color: #b91c1c; }

      .ticket-box { background: #f8fafc; border-radius: 24px; padding: 1.5rem; margin-bottom: 1.2rem; border: 1px solid var(--border); position: relative; }
      .reply-box { background: white; padding: 1.2rem; border-radius: 18px; margin-top: 1rem; border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
      
      .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .setting-item { background: #fcfcfc; border: 1px solid var(--border); padding: 1rem; border-radius: 18px; display: flex; justify-content: space-between; align-items: center; }
      
      @media (max-width: 600px) { 
        .settings-grid { grid-template-columns: 1fr; }
        .truncate { max-width: 120px; }
      }
    </style>
  </head>
  <body>
    <div id="snackbar"></div>
    <div id="panelOverlay" class="panel-overlay"></div>

    <div id="promptModal" class="cpie-modal">
      <div class="modal-content">
        <div class="modal-title" id="promptTitle" style="font-weight:900; font-size:1.3rem; margin-bottom:1rem;">Confirm Action</div>
        <div id="promptBody" style="margin-bottom:1rem; font-size:0.9rem; color:var(--text-muted); font-weight:600;"></div>
        <div id="promptInputArea"></div>
        <div class="modal-footer" style="display:flex; gap:10px; margin-top:1.5rem;">
          <button class="btn-grad" style="flex:1; background:#f1f5f9; color:var(--text-main); box-shadow:none;" onclick="closeModal()">Cancel</button>
          <button class="btn-grad" style="flex:1;" id="promptConfirmBtn">Confirm</button>
        </div>
      </div>
    </div>

    <header class="sticky-header">
       <div style="display:flex; align-items:center; gap:10px;">
         <i class="fas fa-chart-pie" style="color:var(--primary); font-size:1.6rem;"></i>
         <h1 id="siteName" style="font-weight:900; font-size:1.3rem;">...</h1>
       </div>
       <div style="display:flex; align-items:center; gap:12px;">
         <span id="userName" class="truncate" style="font-weight:700; font-size:0.85rem; color:var(--text-muted);">...</span>
         <div style="width:38px; height:38px; background:var(--dark); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:0.9rem;" id="userInitial">?</div>
       </div>
    </header>

    <div class="main-container">
      ${role === 'admin' ? `
        <div class="admin-hero">
          <h3 style="font-weight:900; margin-bottom:1.5rem;"><i class="fas fa-shield-check"></i> Command Center</h3>
          <div class="admin-stat-row" id="adminStats"></div>
        </div>

        <div class="glass-card" style="margin-bottom:2rem; overflow:hidden;">
          <h3 class="section-title" style="padding:1.5rem; color:#ef4444;"><i class="fas fa-bolt"></i> Urgent Approvals</h3>
          <div style="overflow-x:auto;"><table class="cpie-table"><tbody id="pendingTxs"></tbody></table></div>
        </div>

        <div class="glass-card" style="margin-bottom:2rem; padding:1.5rem;">
          <h3 class="section-title"><i class="fas fa-cog"></i> Platform Settings</h3>
          <div class="settings-grid" id="adminSettings"></div>
        </div>

        <div class="glass-card" style="margin-bottom:2rem; padding:1.5rem;">
          <h3 class="section-title"><i class="fas fa-rocket"></i> Investment Plan Control</h3>
          <div class="settings-grid" id="adminPlanList"></div>
        </div>

        <div class="glass-card" style="margin-bottom:2rem; overflow:hidden;">
          <h3 class="section-title" style="padding:1.5rem;"><i class="fas fa-users"></i> Investor Base</h3>
          <div style="overflow-x:auto;"><table class="cpie-table"><thead><tr><th>Investor</th><th>Balance</th><th>Principal</th><th>Action</th></tr></thead><tbody id="adminUserList"></tbody></table></div>
        </div>

        <div class="glass-card" style="margin-bottom:2rem; overflow:hidden;">
          <h3 class="section-title" style="padding:1.5rem;"><i class="fas fa-history"></i> Global History</h3>
          <div style="overflow-x:auto;"><table class="cpie-table"><thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead><tbody id="adminGlobalTxList"></tbody></table></div>
          <div style="padding:1rem; text-align:center;"><button class="toggle-link" style="font-size:0.7rem;" onclick="loadMoreHistory()">See More History...</button></div>
        </div>

        <div class="glass-card" style="padding:1.5rem;">
          <h3 class="section-title"><i class="fas fa-headset"></i> Support Queue</h3>
          <div id="adminTicketList"></div>
        </div>
      ` : `
        <div class="hero-stat-card glass-card">
          <h4>Net Portfolio Value</h4>
          <div class="val" id="userBalance">$0.00</div>
        </div>

        <div class="sub-stat-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; margin-bottom:2rem;">
          <div class="glass-card sub-stat-card"><h4>Working Capital</h4><div class="val" id="userInv">$0</div></div>
          <div class="glass-card sub-stat-card"><h4>Total Returns</h4><div class="val" id="userProf" style="color:#10b981;">$0</div></div>
        </div>

        <div class="action-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; margin:2rem 0;">
          <div class="action-btn" onclick="openPanel('depositPanel')"><i class="fas fa-plus"></i><span>Deposit</span></div>
          <div class="action-btn" onclick="openPanel('withdrawPanel')"><i class="fas fa-arrow-up"></i><span>Withdraw</span></div>
        </div>

        <div id="plansSect" class="glass-card" style="margin-bottom:2rem; overflow:hidden;">
          <h3 class="section-title" style="padding:1.5rem;"><i class="fas fa-star"></i> Investment Tiers</h3>
          <div id="userPlanList"></div>
        </div>

        <div class="glass-card" style="margin-bottom:2rem; overflow:hidden;">
          <h3 class="section-title" style="padding:1.5rem;"><i class="fas fa-history"></i> Recent Activity</h3>
          <div style="overflow-x:auto;"><table class="cpie-table"><tbody id="userTxList"></tbody></table></div>
        </div>

        <div id="supportSect" class="glass-card" style="padding:2rem;">
          <h3 class="section-title" style="margin-bottom:1rem;"><i class="fas fa-comments"></i> Support Center</h3>
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
      <a class="footer-item" onclick="handleLogout()"><i class="fas fa-sign-out-alt"></i><span>Exit</span></a>
    </nav>

    <!-- Panels -->
    <div id="depositPanel" class="slide-panel">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h2 style="font-weight:900;">Add Funds</h2>
        <button onclick="closePanel()" style="background:none; border:none; font-size:1.5rem;"><i class="fas fa-times"></i></button>
      </div>
      <div id="cryptoList"></div>
      <input type="number" id="depAmt" class="panel-input" placeholder="Amount in USD">
      <button class="btn-grad" style="width:100%;" onclick="submitTx('deposit', 'depAmt')">Confirm Notification <i class="fas fa-check"></i></button>
    </div>

    <div id="withdrawPanel" class="slide-panel">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h2 style="font-weight:900;">Withdraw</h2>
        <button onclick="closePanel()" style="background:none; border:none; font-size:1.5rem;"><i class="fas fa-times"></i></button>
      </div>
      <div class="bank-box" id="bankInfoBox">...</div>
      <input type="number" id="wdAmt" class="panel-input" placeholder="Amount in USD">
      <button class="btn-grad" style="width:100%;" onclick="submitTx('withdraw', 'wdAmt')">Request Payout <i class="fas fa-arrow-right"></i></button>
    </div>

    <div id="editUserPanel" class="slide-panel">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h2 style="font-weight:900;">Edit Investor</h2>
        <button onclick="closePanel()" style="background:none; border:none; font-size:1.5rem;"><i class="fas fa-times"></i></button>
      </div>
      <input type="hidden" id="editUserId">
      <div class="input-group"><label>Full Name</label><input type="text" id="editUserName" class="panel-input"></div>
      <div class="input-group"><label>New Password (Leave blank)</label><input type="text" id="editUserPass" class="panel-input" placeholder="••••••••"></div>
      <div class="input-group"><label>Balance ($)</label><input type="number" id="editUserBal" class="panel-input"></div>
      <div class="input-group"><label>Profit ($)</label><input type="number" id="editUserProf" class="panel-input"></div>
      <div class="input-group"><label>Principal ($)</label><input type="number" id="editUserInv" class="panel-input"></div>
      <div class="input-group"><label>Account Status</label><select id="editUserStatus" class="panel-input"><option value="Active">Active</option><option value="Suspended">Suspended</option></select></div>
      <button class="btn-grad" style="width:100%;" onclick="saveUserEdit()">Save Changes <i class="fas fa-save"></i></button>
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

      function showPrompt(title, body, inputPlaceholder, onConfirm) {
        document.getElementById('promptTitle').innerText = title;
        document.getElementById('promptBody').innerText = body;
        const inputArea = document.getElementById('promptInputArea');
        inputArea.innerHTML = '';
        if(inputPlaceholder) inputArea.innerHTML = \`<input type="text" id="modalInput" class="panel-input" placeholder="\${inputPlaceholder}">\`;
        document.getElementById('promptConfirmBtn').onclick = () => {
          const val = inputPlaceholder ? document.getElementById('modalInput').value : true;
          onConfirm(val);
          closeModal();
        };
        document.getElementById('promptModal').classList.add('active');
      }
      function closeModal() { document.getElementById('promptModal').classList.remove('active'); }

      function copyText(id, label) {
        const text = document.getElementById(id).innerText;
        navigator.clipboard.writeText(text);
        showSnackbar(label + " copied!", "success");
      }

      async function handleLogout() { await fetch('/api/logout', { method:'POST' }); window.location.reload(); }

      async function submitTx(type, inputId) {
        const amount = document.getElementById(inputId).value;
        if(!amount || amount <= 0) return showSnackbar("Invalid amount", "error");
        const res = await fetch(\`/api/\${type}\`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ amount:parseFloat(amount) }) });
        const data = await res.json();
        if(data.success) { showSnackbar(data.message, "success"); closePanel(); loadData(); }
        else showSnackbar(data.message, "error");
      }

      async function buyPlan(planId, amount) {
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
        const res = await fetch('/api/admin/tx/process', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ txId, action }) });
        const data = await res.json(); if(data.success) loadData();
      }

      async function updateSetting(key, value) {
        const res = await fetch('/api/admin/settings/update', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ key, value }) });
        const data = await res.json(); if(data.success) { showSnackbar("Updated", "success"); loadData(); }
      }

      function editPlan(id, curName) {
        showPrompt("Plan Name", "New name for " + curName, "Plan Name", (name) => {
          if(!name) return;
          showPrompt("Min Amount", "Min for " + name, "Amount", (min) => {
            if(!min) return;
            showPrompt("ROI", "ROI %", "ROI", (roi) => {
              if(!roi) return;
              showPrompt("Days", "Days", "Days", async (days) => {
                const body = { id, name, min_amount:parseFloat(min), roi:parseFloat(roi), days:parseInt(days) };
                await fetch('/api/admin/plans/update', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
                loadData();
              });
            });
          });
        });
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

      async function replyTicket(ticketId) {
        showPrompt("Reply", "Enter message:", "Reply content", async (reply) => {
          if(!reply) return;
          await fetch('/api/admin/ticket/reply', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ticketId, reply }) });
          loadData();
        });
      }

      function loadMoreHistory() { historyLimit += 50; loadData(); }

      async function loadData() {
        try {
          if('${role}' === 'admin') {
            const res = await fetch(\`/api/admin/data?limit=\${historyLimit}\`);
            const data = await res.json();
            document.getElementById('adminStats').innerHTML = \`
              <div><p style="opacity:0.6; font-size:0.6rem; font-weight:900;">LIQUIDITY</p><div style="font-size:1.4rem; font-weight:900;">$\${data.stats.totalBal.toLocaleString()}</div></div>
              <div><p style="opacity:0.6; font-size:0.6rem; font-weight:900;">PRINCIPAL</p><div style="font-size:1.4rem; font-weight:900;">$\${data.stats.totalInv.toLocaleString()}</div></div>
              <div><p style="opacity:0.6; font-size:0.6rem; font-weight:900;">USERS</p><div style="font-size:1.4rem; font-weight:900;">\${data.stats.users}</div></div>
            \`;
            const pendingTbody = document.getElementById('pendingTxs'); pendingTbody.innerHTML = '';
            data.pending.forEach(tx => {
              pendingTbody.innerHTML += \`<tr><td><strong><span class="truncate">\${tx.userName}</span></strong><br><small>\${tx.type}</small></td><td style="color:var(--primary); font-weight:900;">$\${parseFloat(tx.amount).toLocaleString()}</td><td><div style="display:flex; gap:5px;"><button class="btn-grad" style="padding:6px 10px; font-size:0.6rem;" onclick="processRequest('\${tx.id}', 'Approved')">OK</button><button class="btn-grad" style="padding:6px 10px; font-size:0.6rem; background:#ef4444;" onclick="processRequest('\${tx.id}', 'Rejected')">REJ</button></div></td></tr>\`;
            });
            const settingsDiv = document.getElementById('adminSettings'); settingsDiv.innerHTML = '';
            data.settings.forEach(s => {
              if(s.key_name === 'eth_address' || s.key_name === 'usdt_trc20') return;
              settingsDiv.innerHTML += \`<div class="setting-item"><div><strong style="font-size:0.65rem;">\${s.key_name.toUpperCase()}</strong><br><small class="truncate" style="color:var(--text-muted);">\${s.value}</small></div><button class="btn-grad" style="padding:6px 10px; font-size:0.6rem;" onclick="showPrompt('Edit', 'New value', '\${s.value}', (v) => updateSetting('\${s.key_name}', v))">EDIT</button></div>\`;
            });
            const planDiv = document.getElementById('adminPlanList'); planDiv.innerHTML = '';
            data.plans.forEach(p => {
              planDiv.innerHTML += \`<div class="setting-item"><div><strong style="font-size:0.65rem;">\${p.name}</strong><br><small style="color:var(--text-muted);">$\${p.min_amount}</small></div><button class="btn-grad" style="padding:6px 10px; font-size:0.6rem;" onclick="editPlan('\${p.id}', '\${p.name}')">EDIT</button></div>\`;
            });
            const userTbody = document.getElementById('adminUserList'); userTbody.innerHTML = '';
            data.users.forEach(u => {
              userTbody.innerHTML += \`<tr><td><strong><span class="truncate">\${u.name}</span></strong><br><small>\${u.username}</small></td><td>$\${parseFloat(u.balance).toLocaleString()}</td><td>$\${parseFloat(u.investment).toLocaleString()}</td><td><button onclick="openEditUser('\${u.id}','\${u.name}',\${u.balance},\${u.profit},\${u.investment},'\${u.status}')" style="border:none; background:none; color:var(--primary); font-size:1.2rem;"><i class="fas fa-edit"></i></button></td></tr>\`;
            });
            const globalHistTbody = document.getElementById('adminGlobalTxList'); globalHistTbody.innerHTML = '';
            data.globalHistory.forEach(tx => {
              globalHistTbody.innerHTML += \`<tr><td><strong><span class="truncate">\${tx.userName}</span></strong></td><td>\${tx.type}</td><td style="font-weight:900;">$\${parseFloat(tx.amount).toLocaleString()}</td><td><span class="pill \${tx.status === 'Approved' ? 'pill-approved' : tx.status === 'Pending' ? 'pill-pending' : 'pill-rejected'}">\${tx.status}</span></td></tr>\`;
            });
            const ticketDiv = document.getElementById('adminTicketList'); ticketDiv.innerHTML = '';
            data.tickets.forEach(tk => {
              ticketDiv.innerHTML += \`<div class="ticket-box"><strong>\${tk.userName}</strong>: \${tk.subject}<br><small>\${tk.message}</small>\${tk.reply ? \`<div class="reply-box"><strong>Admin Reply:</strong><br>\${tk.reply}</div>\` : \`<button class="btn-grad" style="margin-top:10px; padding:6px 12px; font-size:0.7rem;" onclick="replyTicket('\${tk.id}')">REPLY</button>\`}</div>\`;
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
            
            document.getElementById('bankInfoBox').innerHTML = \`<p style="font-size:0.6rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Bank Payout Details</p><h4 style="font-weight:900; margin:5px 0;">\${data.settings.bank_name}</h4><p style="font-size:0.8rem; font-weight:600;">\${data.settings.account_name}<br>\${data.settings.account_number}</p>\`;
            document.getElementById('cryptoList').innerHTML = \`<div class="bank-box" style="margin-bottom:1rem;"><p style="font-size:0.6rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">BTC ADDRESS</p><code id="btc_addr" style="font-size:0.7rem;">\${data.settings.btc_address}</code><br><button onclick="copyText('btc_addr', 'BTC')" class="toggle-link" style="font-size:0.65rem; margin-top:5px;">Copy</button></div>\`;
            
            const userPlanList = document.getElementById('userPlanList'); userPlanList.innerHTML = '';
            data.plans.forEach(p => {
              userPlanList.innerHTML += \`<div class="plan-item"><div><strong>\${p.name}</strong><br><small style="color:var(--text-muted);">\${p.roi}% Return • \${p.days}d</small></div><button class="btn-grad" style="padding:10px 20px; font-size:0.75rem;" onclick="showPrompt('Invest', 'Min $\${p.min_amount}', '\${p.min_amount}', (a) => buyPlan('\${p.id}', a))">Invest $\${parseFloat(p.min_amount).toLocaleString()}+</button></div>\`;
            });
            
            const histTbody = document.getElementById('userTxList'); histTbody.innerHTML = '';
            data.transactions.forEach(tx => {
              histTbody.innerHTML += \`<tr><td><strong>\${tx.type}</strong><br><small>\${new Date(tx.created_at).toLocaleDateString()}</small></td><td style="font-weight:900;">$\${parseFloat(tx.amount).toLocaleString()}</td><td><span class="pill \${tx.status === 'Pending' ? 'pill-pending' : tx.status === 'Approved' ? 'pill-approved' : 'pill-rejected'}">\${tx.status}</span></td></tr>\`;
            });
            const uTicketDiv = document.getElementById('userTicketList'); uTicketDiv.innerHTML = '';
            data.tickets.forEach(tk => {
              uTicketDiv.innerHTML += \`<div class="ticket-box"><strong>\${tk.subject}</strong> <span class="pill \${tk.status === 'Open' ? 'pill-pending' : 'pill-approved'}">\${tk.status}</span><br><small>\${tk.message}</small>\${tk.reply ? \`<div class="reply-box"><strong>Admin Reply:</strong><br>\${tk.reply}</div>\` : ''}</div>\`;
            });
          }
        } catch(e) { console.error(e); }
      }
      loadData();
    </script>
  </body></html>`;
}

module.exports = dashboardTemplate;
