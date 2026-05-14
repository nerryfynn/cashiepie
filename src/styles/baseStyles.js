const baseStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; outline: none; -webkit-tap-highlight-color: transparent; }
  :root {
    --primary: #e67e22;
    --primary-grad: linear-gradient(135deg, #e67e22 0%, #f39c12 100%);
    --dark: #0f172a;
    --bg: #f8fafc;
    --white: #ffffff;
    --glass: rgba(255, 255, 255, 0.85);
    --border: #f1f5f9;
    --text-main: #1e293b;
    --text-muted: #64748b;
    --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    --header-h: 70px;
    --footer-h: 75px;
  }
  
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }

  body { 
    background: var(--bg); 
    font-family: 'Inter', system-ui, -apple-system, sans-serif; 
    min-height: 100vh; 
    color: var(--text-main); 
    overflow-x: hidden; 
    line-height: 1.5;
  }
  
  .glass-card { 
    background: var(--white); 
    border-radius: 30px; 
    border: 1px solid var(--border); 
    box-shadow: var(--shadow-sm); 
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
    animation: fadeIn 0.6s ease-out;
  }
  .glass-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }

  .btn-grad { 
    background: var(--primary-grad); color: white; border: none; 
    padding: 16px 32px; border-radius: 100px; font-weight: 800; 
    cursor: pointer; transition: all 0.3s; 
    box-shadow: 0 10px 25px rgba(230, 126, 34, 0.25); 
    display: flex; align-items: center; justify-content: center; gap: 10px;
    font-size: 0.95rem;
  }
  .btn-grad:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(230, 126, 34, 0.35); }
  .btn-grad:active { transform: scale(0.96); }

  #snackbar { 
    visibility: hidden; min-width: 320px; background: #1e293b; color: #fff; 
    border-radius: 20px; padding: 18px 24px; position: fixed; z-index: 10000; 
    left: 50%; bottom: 30px; transform: translateX(-50%) translateY(30px); 
    font-weight: 700; box-shadow: 0 25px 50px rgba(0,0,0,0.3); 
    transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); opacity: 0;
    display: flex; align-items: center; gap: 12px; font-size: 0.9rem;
  }
  #snackbar.show { visibility: visible; opacity: 1; transform: translateX(-50%) translateY(0); }
  #snackbar.error { border-left: 8px solid #ef4444; }
  #snackbar.success { border-left: 8px solid #10b981; }

  .sticky-header {
    position: sticky; top: 0; background: rgba(255,255,255,0.85); 
    backdrop-filter: blur(15px); z-index: 1000; height: var(--header-h);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 1.5rem; border-bottom: 1px solid var(--border);
  }

  .sticky-footer {
    position: fixed; bottom: 0; left: 0; right: 0; height: var(--footer-h);
    background: rgba(255,255,255,0.9); backdrop-filter: blur(15px);
    border-top: 1px solid var(--border); z-index: 1000;
    display: flex; justify-content: space-around; align-items: center;
    padding: 0 1.5rem; padding-bottom: 15px;
  }
  .footer-item { 
    display: flex; flex-direction: column; align-items: center; 
    gap: 5px; color: var(--text-muted); text-decoration: none; font-size: 0.75rem; font-weight: 800;
    cursor: pointer; transition: 0.3s;
  }
  .footer-item i { font-size: 1.4rem; }
  .footer-item.active { color: var(--primary); }

  .slide-panel {
    position: fixed; top: 0; right: -100%; width: 100%; max-width: 450px; height: 100%; 
    background: white; z-index: 6000; box-shadow: -20px 0 60px rgba(0,0,0,0.1);
    transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1); padding: 2.5rem;
  }
  .slide-panel.active { right: 0; }
  .panel-overlay {
    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px);
    z-index: 5999; visibility: hidden; opacity: 0; transition: 0.4s;
  }
  .panel-overlay.active { visibility: visible; opacity: 1; }

  .panel-input {
    width: 100%; padding: 18px; border-radius: 18px; border: 2px solid var(--border);
    margin-bottom: 1.2rem; font-size: 1rem; font-weight: 600; font-family: inherit;
    transition: 0.3s;
  }
  .panel-input:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 4px rgba(230, 126, 34, 0.1); }

  .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin: 2rem 0; }
  .action-btn { 
    background: white; border: 1px solid var(--border); border-radius: 24px; 
    padding: 1.8rem; text-align: center; cursor: pointer; transition: 0.4s;
    box-shadow: var(--shadow-sm);
  }
  .action-btn:hover { border-color: var(--primary); transform: translateY(-5px); box-shadow: var(--shadow-md); }
  .action-btn i { font-size: 1.8rem; color: var(--primary); margin-bottom: 0.8rem; display: block; }
  .action-btn span { font-weight: 800; font-size: 0.9rem; color: var(--text-main); }

  .cpie-table { width: 100%; border-collapse: collapse; }
  .cpie-table th { text-align: left; padding: 16px; font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: 900; letter-spacing: 0.5px; }
  .cpie-table td { padding: 18px 16px; border-top: 1px solid var(--border); font-size: 0.95rem; }

  .no-underline { text-decoration: none !important; }
  
  @media (max-width: 600px) {
    .slide-panel { 
      max-width: 100%; height: auto; max-height: 92vh; 
      bottom: 0; top: auto; border-radius: 40px 40px 0 0; 
      padding: 2rem; overflow-y: auto; 
    }
    .slide-panel.active { transform: translateY(0); right: 0; }
    .main-container { padding: 1rem; }
    .action-grid { gap: 0.8rem; }
    .action-btn { padding: 1.2rem; }
    .hero-stat-card { padding: 1.8rem; border-radius: 25px; }
    .hero-stat-card .val { font-size: 2.2rem; }
  }
`;

module.exports = baseStyles;
