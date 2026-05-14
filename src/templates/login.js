const baseStyles = require('../styles/baseStyles');

function loginTemplate() {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to CashiePie</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
      ${baseStyles}
      body { 
        display: flex; align-items: center; justify-content: center; 
        background: radial-gradient(circle at top right, #fff5eb, #f8fafc);
        padding: 2rem 1rem; min-height: 100vh; overflow-y: auto;
      }
      .login-container { width: 100%; max-width: 380px; display: flex; flex-direction: column; align-items: center; }
      .brand-box { text-align: center; margin-bottom: 0.8rem; animation: fadeIn 0.8s ease-out; }
      .brand-box i { font-size: 2.2rem; color: var(--primary); margin-bottom: 0.2rem; }
      .brand-box h1 { font-size: 1.6rem; font-weight: 900; letter-spacing: -1px; }
      .brand-box p { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }
      
      .form-section { display: none; }
      .form-section.active { display: block; animation: fadeIn 0.4s ease-out; }
      
      .input-group { margin-bottom: 0.5rem; }
      .input-group label { display: block; font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.2rem; margin-left: 0.4rem; }
      
      .auth-card { padding: 1.5rem; width: 100%; border-radius: 20px; }
      .toggle-link { color: var(--primary); font-weight: 800; cursor: pointer; transition: 0.3s; text-decoration: none; font-size: 0.8rem; }
      .toggle-link:hover { text-decoration: underline; }
      
      .compact-input { padding: 10px 15px !important; margin-bottom: 0.2rem !important; font-size: 0.85rem !important; border-radius: 12px !important; }
      .btn-grad { padding: 12px 24px !important; font-size: 0.85rem !important; margin-top: 0.5rem !important; }
      
      h2 { font-size: 1.3rem !important; margin-bottom: 0.8rem !important; font-weight: 900 !important; }
      
      @media (max-height: 550px) and (max-width: 600px) {
        .brand-box { display: none; }
      }
      @media (max-width: 600px) {
        .auth-card { padding: 1.2rem; }
      }
    </style>
  </head>
  <body>
    <div id="snackbar"></div>
    
    <div class="login-container">
      <div class="brand-box">
        <i class="fas fa-chart-pie"></i>
        <h1>CashiePie</h1>
        <p style="color:var(--text-muted); font-weight:600; margin-top:0.5rem;">Secure Asset Ecosystem</p>
      </div>

      <div class="glass-card auth-card">
        <!-- Login Form -->
        <div id="loginForm" class="form-section active">
          <h2 style="font-weight:900; margin-bottom:1.5rem; font-size:1.6rem;">Sign In</h2>
          <form onsubmit="handleAuth(event, '/api/login')">
            <div class="input-group">
              <label>Username</label>
              <input type="text" name="username" class="panel-input compact-input" placeholder="@handle" required oninput="prefixHandle(this)">
            </div>
            <div class="input-group">
              <label>Password</label>
              <input type="password" name="password" class="panel-input compact-input" placeholder="••••••••" required>
            </div>
            <div style="text-align:right; margin-bottom:1rem;">
              <span class="toggle-link" style="font-size:0.7rem; opacity:0.7;" onclick="toggleForm('forgotForm')">Forgot Password?</span>
            </div>
            <button class="btn-grad" style="width:100%; margin-top:0.5rem;">Access Dashboard <i class="fas fa-arrow-right"></i></button>
          </form>
          <p style="text-align:center; margin-top:0.8rem; font-size:0.85rem; color:var(--text-muted); font-weight:600;">
            New to CashiePie? <span class="toggle-link" onclick="toggleForm('regForm')">Create Account</span>
          </p>
        </div>

        <!-- Register Form -->
        <div id="regForm" class="form-section">
          <h2 style="font-weight:900; margin-bottom:1.5rem; font-size:1.6rem;">Get Started</h2>
          <form onsubmit="handleAuth(event, '/api/register')">
            <div class="input-group">
              <label>Full Name</label>
              <input type="text" name="name" class="panel-input compact-input" placeholder="Your Name" required>
            </div>
            <div class="input-group">
              <label>Username</label>
              <input type="text" name="username" class="panel-input compact-input" placeholder="@handle" required oninput="prefixHandle(this)">
            </div>
            <div class="input-group">
              <label>New Password</label>
              <input type="password" name="password" class="panel-input compact-input" placeholder="Min. 6 chars" required>
            </div>
            <div class="input-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" class="panel-input compact-input" placeholder="••••••••" required>
            </div>
            <button class="btn-grad" style="width:100%; margin-top:0.5rem;">Join Now <i class="fas fa-user-plus"></i></button>
          </form>
          <p style="text-align:center; margin-top:0.8rem; font-size:0.85rem; color:var(--text-muted); font-weight:600;">
            Already a member? <span class="toggle-link" onclick="toggleForm('loginForm')">Log In</span>
          </p>
        </div>

        <!-- Forgot Password Form -->
        <div id="forgotForm" class="form-section">
          <h2 style="font-weight:900; margin-bottom:1.5rem; font-size:1.6rem;">Recover Access</h2>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1.2rem; font-weight:600;">Enter your username or email to request a secure reset link.</p>
          <form onsubmit="handleForgot(event)">
            <div class="input-group">
              <label>Account Identifier</label>
              <input type="text" id="forgotId" class="panel-input compact-input" placeholder="@username or email" required>
            </div>
            <button class="btn-grad" style="width:100%; margin-top:1rem;">Request Reset <i class="fas fa-paper-plane"></i></button>
          </form>
          <p style="text-align:center; margin-top:1.5rem; font-size:0.85rem; color:var(--text-muted); font-weight:600;">
            Remembered? <span class="toggle-link" onclick="toggleForm('loginForm')">Back to Login</span>
          </p>
        </div>
      </div>
    </div>

    <script>
      function prefixHandle(el) {
        let val = el.value;
        if (val && !val.startsWith('@')) el.value = '@' + val;
        el.value = '@' + el.value.replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, '');
      }

      function handleForgot(e) {
        e.preventDefault();
        const id = document.getElementById('forgotId').value;
        const msg = encodeURIComponent(\`Hello, I would like to request a password reset for my account: \${id}. Please provide a reset link.\`);
        window.open(\`https://wa.me/123456?text=\${msg}\`, '_blank');
        showSnackbar("Request sent to secure support channel", "success");
        toggleForm('loginForm');
      }

      function showSnackbar(msg, type) {
        const sb = document.getElementById("snackbar");
        sb.innerHTML = \`<i class="fas \${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> \${msg}\`;
        sb.className = "show " + (type || "");
        setTimeout(() => { sb.className = ""; }, 3000);
      }

      function toggleForm(id) {
        document.querySelectorAll('.form-section').forEach(f => f.classList.remove('active'));
        document.getElementById(id).classList.add('active');
      }

      async function handleAuth(e, url) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const body = Object.fromEntries(formData.entries());
        
        // Referral sync
        const urlParams = new URLSearchParams(window.location.search);
        if(urlParams.has('ref')) body.ref = urlParams.get('ref');

        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json();
        if(data.success) {
          if(url === '/api/login') { showSnackbar("Welcome back!", "success"); setTimeout(() => window.location.reload(), 800); }
          else { showSnackbar("Account created! Please log in.", "success"); toggleForm('loginForm'); }
        } else showSnackbar(data.message || "Something went wrong", "error");
      }
    </script>
  </body></html>`;
}

module.exports = loginTemplate;
