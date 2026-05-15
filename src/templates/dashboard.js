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
      .main-container { max-width: 800px; margin: 0 auto; padding: 2rem; padding-bottom: 140px; }
      .hero-stat-card { padding: 2.5rem; margin-bottom: 2rem; border: none; background: var(--primary-grad); color: white; box-shadow: 0 15px 35px rgba(230, 126, 34, 0.2); border-radius: 35px; position: relative; overflow: hidden; z-index: 10; }
      .hero-stat-card h4 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9; font-weight: 800; margin-bottom: 0.5rem; }
      .hero-stat-card .val { font-size: clamp(1.4rem, 8vw, 3rem); font-weight: 900; letter-spacing: -1.5px; white-space: nowrap; overflow: hidden; }
      
      .sub-stat-card { position: relative; z-index: 5; }
      .sub-stat-card .val { font-size: clamp(0.9rem, 5vw, 1.8rem); font-weight: 900; color: var(--dark); margin-top: 5px; white-space: nowrap; overflow: hidden; }
      
      .pill { padding: 8px 16px; border-radius: 100px; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
      .pill-pending { background: #fff7ed; color: #ea580c; }
      .pill-approved { background: #f0fdf4; color: #16a34a; }
      .pill-rejected { background: #fef2f2; color: #dc2626; }

      .admin-hero { background: #0f172a; color: white; padding: 3rem; border-radius: 40px; margin-bottom: 2.5rem; }
      .admin-stat-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; }
      .admin-stat-item { background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); }

      .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; display: inline-block; }
      .truncate-phone { display: inline-block; }
      
      .cpie-modal { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); z-index: 9000; display: none !important; align-items: center; justify-content: center; padding: 20px; }
      .cpie-modal.active { display: flex !important; animation: fadeIn 0.3s ease-out; }

      @media (max-width: 600px) { 
        .main-container { padding: 1.2rem; padding-bottom: 110px; }
        .admin-stat-row { grid-template-columns: 1fr; }
        .truncate-phone { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px; }
      }
    </style>
  </head>
  <body>
    <div id="snackbar"></div>
    <div id="panelOverlay" class="panel-overlay"></div>

    <div id="promptModal" class="cpie-modal">
      <div class="modal-content" style="background: white; width: 100%; max-width: 400px; padding: 2rem; border-radius: 28px; box-shadow: 0 25px 50px rgba(0,0,0,0.2);">
        <div class="modal-title" id="promptTitle" style="font-weight:900; font-size:1.4rem; margin-bottom:1rem; color:var(--dark);">Confirm Action</div>
        <div id="promptBody" style="margin-bottom:1.5rem; font-size:0.95rem; color:var(--text-muted); font-weight:600; line-height:1.5;"></div>
        <div id="promptInputArea"></div>
        <div class="modal-footer" style="display:flex; gap:12px; margin-top:2rem;">
          <button class="btn-grad" style="flex:1; background:#f1f5f9; color:var(--text-main); box-shadow:none;" onclick="closeModal()">Cancel</button>
          <button class="btn-grad" style="flex:1;" id="promptConfirmBtn">Confirm</button>
        </div>
      </div>
    </div>

    <header class="sticky-header" style="padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
       <div style="display:flex; align-items:center; gap:10px;">
         <div style="width:40px; height:40px; background:var(--primary-grad); border-radius:12px; display:flex; align-items:center; justify-content:center;">
           <i class="fas fa-chart-pie" style="color:white; font-size:1.2rem;"></i>
         </div>
         <h1 id="siteName" style="font-weight:900; font-size:1.3rem; letter-spacing:-0.5px;">...</h1>
       </div>
       <div style="display:flex; align-items:center; gap:10px;">
         <span id="userName" class="truncate-phone" style="font-weight:800; font-size:0.85rem; color:var(--text-muted);">...</span>
         <div style="width:38px; height:38px; background:var(--dark); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:0.9rem; border:2px solid white; box-shadow:var(--shadow-sm);" id="userInitial">?</div>
       </div>
    </header>

    <div class="main-container">
      ${role === 'admin' ? `
        <div class="admin-hero">
          <h3 style="font-weight:900; margin-bottom:2rem; font-size:1.6rem;"><i class="fas fa-shield-check" style="color:var(--primary);"></i> Command Center</h3>
          <div class="admin-stat-row" id="adminStats"></div>
        </div>

        <div class="glass-card" style="margin-bottom:2.5rem; overflow:hidden;">
          <h3 class="section-title" style="padding:2rem 2rem 0.5rem 2rem; color:#ef4444;"><i class="fas fa-bolt"></i> Urgent Approvals</h3>
          <div style="overflow-x:auto;"><table class="cpie-table"><tbody id="pendingTxs"></tbody></table></div>
        </div>

        <div class="glass-card" style="margin-bottom:2.5rem; padding:2rem;">
          <h3 class="section-title"><i class="fas fa-cog"></i> Platform Settings</h3>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:1rem;" id="adminSettings"></div>
        </div>

        <div class="glass-card" style="margin-bottom:2.5rem; padding:2rem;">
          <h3 class="section-title"><i class="fas fa-rocket"></i> Investment Plan Control</h3>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:1rem;" id="adminPlanList"></div>
        </div>

        <div class="glass-card" style="margin-bottom:2.5rem; overflow:hidden;">
          <h3 class="section-title" style="padding:2rem 2rem 0.5rem 2rem;"><i class="fas fa-users"></i> Investor Base</h3>
          <div style="overflow-x:auto;"><table class="cpie-table"><thead><tr><th>Investor</th><th>Bank Details</th><th>Balance</th><th>Principal</th><th>Action</th></tr></thead><tbody id="adminUserList"></tbody></table></div>
        </div>

        <div class="glass-card" style="margin-bottom:2.5rem; overflow:hidden;">
          <h3 class="section-title" style="padding:2rem 2rem 0.5rem 2rem;"><i class="fas fa-history"></i> Global History</h3>
          <div style="overflow-x:auto;"><table class="cpie-table"><thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead><tbody id="adminGlobalTxList"></tbody></table></div>
          <div style="padding:1.5rem; text-align:center;"><button class="toggle-link" style="font-size:0.75rem; font-weight:800;" onclick="loadMoreHistory()">VIEW MORE HISTORY <i class="fas fa-chevron-down"></i></button></div>
        </div>

        <div class="glass-card" style="padding:2rem;">
          <h3 class="section-title"><i class="fas fa-headset"></i> Support Queue</h3>
          <div id="adminTicketList"></div>
        </div>
      ` : `
        <div class="hero-stat-card glass-card">
          <h4 id="heroTitle">Available Balance</h4>
          <div class="val" id="userBalance">$0.00</div>
        </div>

        <div class="sub-stat-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; margin-bottom:2.5rem;">
          <div class="glass-card sub-stat-card" style="padding:1.5rem; text-align:center; border-radius:24px;">
            <h4 style="font-size:0.7rem; text-transform:uppercase; opacity:0.6; font-weight:800;">Working Capital</h4>
            <div class="val" id="userInv">$0</div>
          </div>
          <div class="glass-card sub-stat-card" style="padding:1.5rem; text-align:center; border-radius:24px;">
            <h4 style="font-size:0.7rem; text-transform:uppercase; opacity:0.6; font-weight:800;">Total Returns</h4>
            <div class="val" id="userProf" style="color:#10b981;">$0</div>
          </div>
        </div>

        <div class="action-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; margin:2rem 0;">
          <div class="action-btn" onclick="openPanel('depositPanel')"><i class="fas fa-plus"></i><span>Add Funds</span></div>
          <div class="action-btn" onclick="openPanel('withdrawPanel')"><i class="fas fa-arrow-up"></i><span>Withdraw</span></div>
        </div>

        <div id="plansSect" class="glass-card" style="margin-bottom:2.5rem; overflow:hidden;">
          <h3 class="section-title" style="padding:1.5rem;"><i class="fas fa-star"></i> Investment Tiers</h3>
          <div id="userPlanList"></div>
        </div>

        <div class="glass-card" style="margin-bottom:2.5rem; overflow:hidden;">
          <h3 class="section-title" style="padding:1.5rem;"><i class="fas fa-history"></i> Recent Activity</h3>
          <div style="overflow-x:auto;"><table class="cpie-table"><tbody id="userTxList"></tbody></table></div>
        </div>

        <div id="supportSect" class="glass-card" style="padding:2rem;">
          <h3 class="section-title" style="margin-bottom:1rem;"><i class="fas fa-comments"></i> Support Center</h3>
          <div id="userTicketList"></div>
          <div style="margin-top:2rem;">
            <input type="text" id="ticketSub" class="panel-input" placeholder="Subject">
            <textarea id="ticketMsg" class="panel-input" style="height:100px; resize:none;" placeholder="How can we help?"></textarea>
            <button class="btn-grad" style="width:100%;" onclick="createTicket()">Send Message <i class="fas fa-paper-plane"></i></button>
          </div>
        </div>
      `}
    </div>

    <nav class="sticky-footer" style="display: flex; justify-content: space-around; align-items: center; padding: 10px 0;">
      <a class="footer-item active" onclick="window.scrollTo({top:0,behavior:'smooth'})"><i class="fas fa-home"></i><span>Home</span></a>
      ${role === 'user' ? `
        <a class="footer-item" onclick="openPanel('depositPanel')"><i class="fas fa-plus-circle"></i><span>Deposit</span></a>
        <a class="footer-item" onclick="openPanel('withdrawPanel')"><i class="fas fa-arrow-circle-up"></i><span>Withdraw</span></a>
      ` : ''}
      <a class="footer-item" onclick="handleLogout()"><i class="fas fa-sign-out-alt" style="color:#ef4444;"></i><span>Exit</span></a>
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
      <div class="glass-card" style="padding:1.5rem; margin-bottom:1.5rem; border:1px dashed var(--primary);">
        <h4 style="font-size:0.65rem; text-transform:uppercase; opacity:0.6; font-weight:800; margin-bottom:10px;">Your Payout Bank</h4>
        <div id="bankDisplay">
          <p style="font-size:0.9rem; font-weight:900; color:var(--dark);">No bank set</p>
          <button class="toggle-link" style="font-size:0.7rem; margin-top:5px;" onclick="openBankEdit()">Set Bank Details <i class="fas fa-edit"></i></button>
        </div>
      </div>
      <input type="number" id="wdAmt" class="panel-input" placeholder="Amount in USD">
      <button class="btn-grad" style="width:100%;" onclick="submitTx('withdraw', 'wdAmt')">Request Payout <i class="fas fa-arrow-right"></i></button>
    </div>

    <div id="bankEditPanel" class="slide-panel">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h2 style="font-weight:900;">Bank Details</h2>
        <button onclick="closePanel()" style="background:none; border:none; font-size:1.5rem;"><i class="fas fa-times"></i></button>
      </div>
      <div class="input-group"><label>Bank Name</label><input type="text" id="uBankName" class="panel-input" placeholder="e.g. Chase Bank"></div>
      <div class="input-group"><label>Account Number</label><input type="text" id="uBankNum" class="panel-input" placeholder="1234567890"></div>
      <div class="input-group"><label>Account Holder Name</label><input type="text" id="uBankAcc" class="panel-input" placeholder="Full Name"></div>
      <button class="btn-grad" style="width:100%;" onclick="saveBankDetails()">Save Details <i class="fas fa-save"></i></button>
    </div>

    <div id="editUserPanel" class="slide-panel">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h2 style="font-weight:900;">Edit Investor</h2>
        <button onclick="closePanel()" style="background:none; border:none; font-size:1.5rem;"><i class="fas fa-times"></i></button>
      </div>
      <input type="hidden" id="editUserId">
      <div class="input-group"><label>Full Name</label><input type="text" id="editUserName" class="panel-input"></div>
      <div class="input-group"><label>New Password</label><input type="text" id="editUserPass" class="panel-input" placeholder="••••••••"></div>
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
      function openPanel(id) { 
        document.getElementById(id).classList.add('active'); 
        document.getElementById('panelOverlay').classList.add('active'); 
      }
      function closePanel() { 
        document.querySelectorAll('.slide-panel').forEach(p => p.classList.remove('active')); 
        document.getElementById('panelOverlay').classList.remove('active'); 
      }
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

      function openBankEdit() { openPanel('bankEditPanel'); }
      async function saveBankDetails() {
        const bank_name = document.getElementById('uBankName').value;
        const account_number = document.getElementById('uBankNum').value;
        const account_name = document.getElementById('uBankAcc').value;
        if(!bank_name || !account_number || !account_name) return showSnackbar("All fields required", "error");
        const res = await fetch('/api/user/bank/update', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ bank_name, account_name, account_number }) });
        const data = await res.json();
        if(data.success) { showSnackbar("Bank Details Saved", "success"); closePanel(); loadData(); }
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
        else showSnackbar(data.message, "error");
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
              <div class="admin-stat-item"><p style="opacity:0.6; font-size:0.6rem; font-weight:900;">LIQUIDITY</p><div style="font-size:1.4rem; font-weight:900;">$\${parseFloat(data.stats.totalBal).toLocaleString()}</div></div>
              <div class="admin-stat-item"><p style="opacity:0.6; font-size:0.6rem; font-weight:900;">PRINCIPAL</p><div style="font-size:1.4rem; font-weight:900;">$\${parseFloat(data.stats.totalInv).toLocaleString()}</div></div>
              <div class="admin-stat-item"><p style="opacity:0.6; font-size:0.6rem; font-weight:900;">USERS</p><div style="font-size:1.4rem; font-weight:900;">\${data.stats.users}</div></div>
            \`;
            const pendingTbody = document.getElementById('pendingTxs'); pendingTbody.innerHTML = '';
            data.pending.forEach(tx => {
              const bankInfo = tx.type === 'Withdrawal' ? \`<div style="margin-top:8px; padding:10px; background:#f1f5f9; border-radius:12px; font-size:0.7rem; border-left:4px solid var(--primary);"><strong>PAYOUT TO:</strong><br>\${tx.bank_name || 'No Bank'}<br>Acc: \${tx.account_number || '-'}<br>Name: \${tx.account_name || '-'}</div>\` : '';
              pendingTbody.innerHTML += \`<tr><td><strong>\${tx.userName}</strong><br><small>\${tx.type}</small>\${bankInfo}</td><td style="color:var(--primary); font-weight:900;">$\${parseFloat(tx.amount).toLocaleString()}</td><td><div style="display:flex; gap:8px;"><button class="btn-grad" style="padding:8px 12px; font-size:0.7rem;" onclick="processRequest('\${tx.id}', 'Approved')">OK</button><button class="btn-grad" style="padding:8px 12px; font-size:0.7rem; background:#ef4444;" onclick="processRequest('\${tx.id}', 'Rejected')">REJ</button></div></td></tr>\`;
            });
            const settingsDiv = document.getElementById('adminSettings'); settingsDiv.innerHTML = '';
            data.settings.forEach(s => {
              settingsDiv.innerHTML += \`<div class="setting-item" style="background:#fcfcfc; border:1px solid var(--border); padding:1rem; border-radius:18px; display:flex; justify-content:space-between; align-items:center;"><div><strong style="font-size:0.65rem;">\${s.key_name.toUpperCase()}</strong><br><small class="truncate" style="color:var(--text-muted);">\${s.value}</small></div><button class="btn-grad" style="padding:6px 12px; font-size:0.65rem;" onclick="showPrompt('Edit Setting', 'Update \${s.key_name}', '\${s.value}', (v) => updateSetting('\${s.key_name}', v))">EDIT</button></div>\`;
            });
            const planDiv = document.getElementById('adminPlanList'); planDiv.innerHTML = '';
            data.plans.forEach(p => {
              planDiv.innerHTML += \`<div class="setting-item" style="background:#fcfcfc; border:1px solid var(--border); padding:1rem; border-radius:18px; display:flex; justify-content:space-between; align-items:center;"><div><strong style="font-size:0.65rem;">\${p.name}</strong><br><small style="color:var(--text-muted);">$\${p.min_amount}</small></div><button class="btn-grad" style="padding:6px 12px; font-size:0.65rem;" onclick="editPlan('\${p.id}', '\${p.name}')">EDIT</button></div>\`;
            });
            const userTbody = document.getElementById('adminUserList'); userTbody.innerHTML = '';
            data.users.forEach(u => {
              const bankDetails = u.bank_name ? \`<small style="display:block; opacity:0.6; font-size:0.65rem;">\${u.bank_name}<br>\${u.account_number}</small>\` : '<small style="opacity:0.3;">No Bank</small>';
              userTbody.innerHTML += \`<tr><td><strong>\${u.name}</strong><br><small>\${u.username}</small></td><td>\${bankDetails}</td><td>$\${parseFloat(u.balance).toLocaleString()}</td><td>$\${parseFloat(u.investment).toLocaleString()}</td><td><button onclick="openEditUser('\${u.id}','\${u.name}',\${u.balance},\${u.profit},\${u.investment},'\${u.status}')" style="border:none; background:none; color:var(--primary); font-size:1.2rem;"><i class="fas fa-edit"></i></button></td></tr>\`;
            });
            const globalHistTbody = document.getElementById('adminGlobalTxList'); globalHistTbody.innerHTML = '';
            data.globalHistory.forEach(tx => {
              globalHistTbody.innerHTML += \`<tr><td><strong>\${tx.userName}</strong></td><td>\${tx.type}</td><td style="font-weight:900;">$\${parseFloat(tx.amount).toLocaleString()}</td><td><span class="pill \${tx.status === 'Approved' ? 'pill-approved' : tx.status === 'Pending' ? 'pill-pending' : 'pill-rejected'}">\${tx.status}</span></td></tr>\`;
            });
            const ticketDiv = document.getElementById('adminTicketList'); ticketDiv.innerHTML = '';
            data.tickets.forEach(tk => {
              ticketDiv.innerHTML += \`<div class="ticket-box" style="background:#f8fafc; border-radius:24px; padding:1.5rem; margin-bottom:1.2rem; border:1px solid var(--border);"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;"><strong>\${tk.userName}</strong><span class="pill \${tk.status === 'Open' ? 'pill-pending' : 'pill-approved'}">\${tk.status}</span></div><p style="font-size:0.85rem; color:var(--text-muted);">\${tk.message}</p>\${tk.reply ? \`<div class="reply-box" style="background:white; padding:1.2rem; border-radius:18px; margin-top:1rem; border:1px solid var(--border); box-shadow:var(--shadow-sm);"><strong>Admin Reply:</strong><br>\${tk.reply}</div>\` : \`<button class="btn-grad" style="margin-top:10px; padding:8px 16px; font-size:0.7rem;" onclick="replyTicket('\${tk.id}')">REPLY</button>\`}</div>\`;
            });
          } else {
            const res = await fetch('/api/user/data');
            const data = await res.json();
            document.getElementById('siteName').innerText = data.settings.platform_name;
            document.getElementById('userName').innerText = data.user.name;
            document.getElementById('userInitial').innerText = data.user.name.charAt(0);
            document.getElementById('userBalance').innerText = '$' + parseFloat(data.user.balance).toLocaleString('en-US', { minimumFractionDigits: 2 });
            document.getElementById('userInv').innerText = '$' + parseFloat(data.user.investment).toLocaleString();
            document.getElementById('userProf').innerText = '$' + parseFloat(data.user.profit).toLocaleString();
            
            const bankDisplay = document.getElementById('bankDisplay');
            if(data.user.bank_name) {
              bankDisplay.innerHTML = \`<p style="font-size:0.9rem; font-weight:900; color:var(--dark);">\${data.user.bank_name}</p><p style="font-size:0.75rem; font-weight:700; opacity:0.6;">\${data.user.account_name} • \${data.user.account_number}</p><button class="toggle-link" style="font-size:0.7rem; margin-top:5px;" onclick="openBankEdit()">Change Details <i class="fas fa-edit"></i></button>\`;
              document.getElementById('uBankName').value = data.user.bank_name;
              document.getElementById('uBankNum').value = data.user.account_number;
              document.getElementById('uBankAcc').value = data.user.account_name;
            }

            document.getElementById('cryptoList').innerHTML = \`<div class="glass-card" style="padding:1.5rem; margin-bottom:1.5rem; border:1px solid #fed7aa; background:#fff7ed; text-align:center;"><p style="font-size:0.65rem; font-weight:800; color:#ea580c; text-transform:uppercase; margin-bottom:10px;">BITCOIN (BTC) ADDRESS</p><code id="btc_addr" style="font-size:0.8rem; font-weight:900; color:var(--dark); word-break:break-all; display:block; margin-bottom:15px;">\${data.settings.btc_address}</code><button onclick="copyText('btc_addr', 'BTC')" class="btn-grad" style="padding:8px 20px; font-size:0.75rem; background:#ea580c; box-shadow:none;">COPY ADDRESS <i class="fas fa-copy"></i></button></div>\`;
            
            const userPlanList = document.getElementById('userPlanList'); userPlanList.innerHTML = '';
            data.plans.forEach(p => {
              userPlanList.innerHTML += \`<div class="plan-item" style="padding:1.5rem; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;"><div><strong>\${p.name}</strong><br><small style="color:var(--text-muted); font-weight:700;">\${p.roi}% Return • \${p.days}d</small></div><button class="btn-grad" style="padding:10px 20px; font-size:0.75rem;" onclick="showPrompt('Invest', 'Min $\${p.min_amount}', '\${p.min_amount}', (a) => buyPlan('\${p.id}', a))">Invest $\${parseFloat(p.min_amount).toLocaleString()}+</button></div>\`;
            });
            
            const histTbody = document.getElementById('userTxList'); histTbody.innerHTML = '';
            data.transactions.forEach(tx => {
              histTbody.innerHTML += \`<tr><td><strong>\${tx.type}</strong><br><small style="opacity:0.5;">\${new Date(tx.created_at).toLocaleDateString()}</small></td><td style="font-weight:900;">$\${parseFloat(tx.amount).toLocaleString()}</td><td><span class="pill \${tx.status === 'Pending' ? 'pill-pending' : tx.status === 'Approved' ? 'pill-approved' : 'pill-rejected'}">\${tx.status}</span></td></tr>\`;
            });
            const uTicketDiv = document.getElementById('userTicketList'); uTicketDiv.innerHTML = '';
            data.tickets.forEach(tk => {
              uTicketDiv.innerHTML += \`<div class="ticket-box" style="background:#f8fafc; border-radius:24px; padding:1.5rem; margin-bottom:1.2rem; border:1px solid var(--border);"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;"><strong>\${tk.subject}</strong><span class="pill \${tk.status === 'Open' ? 'pill-pending' : 'pill-approved'}">\${tk.status}</span></div><p style="font-size:0.85rem; color:var(--text-muted);">\${tk.message}</p>\${tk.reply ? \`<div class="reply-box" style="background:white; padding:1.2rem; border-radius:18px; margin-top:1rem; border:1px solid var(--border); box-shadow:var(--shadow-sm);"><strong>Admin Reply:</strong><br>\${tk.reply}</div>\` : ''}</div>\`;
            });
          }
        } catch(e) { console.error(e); }
      }
      loadData();
    </script>
  </body></html>`;
}

module.exports = dashboardTemplate;
