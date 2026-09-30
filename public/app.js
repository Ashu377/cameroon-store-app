* { box-sizing: border-box; }
:root {
  --ink: #18332e;
  --muted: #71817c;
  --line: #e7eeeb;
  --bg: #f7faf9;
  --teal: #0d6b5b;
  --mint: #e9f6f1;
  --orange: #ff925c;
  --shadow: 0 12px 35px rgba(35, 72, 62, 0.06);
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: var(--bg);
  color: var(--ink);
}
button, input, select { font: inherit; }
button { cursor: pointer; }
.login-shell {
  position: fixed; inset: 0; display: grid; place-items: center; background: linear-gradient(135deg, #0d6b5b, #192f2d);
  z-index: 50;
}
.login-slot.hidden, .app-shell.hidden { display: none; }
.login-shell.hidden { display: none; }
.login-card {
  width: min(90vw, 420px); background: white; border-radius: 18px; padding: 26px; box-shadow: 0 24px 50px rgba(0,0,0,.18);
}
.login-brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 24px; margin-bottom: 20px; }
.brand-mark { width: 36px; height: 36px; border-radius: 12px; display: grid; place-items: center; background: var(--teal); color: white; }
.brand-accent { color: #08a37d; }
.login-card h1 { margin: 0 0 18px; font-size: 28px; }
.login-card label { display: block; margin: 14px 0; font-size: 12px; color: var(--muted); font-weight: 700; }
.login-card input { display: block; width: 100%; margin-top: 6px; padding: 12px 10px; border-radius: 8px; border: 1px solid var(--line); }
.full { width: 100%; }
.app-shell { display: flex; min-height: 100vh; }
.sidebar {
  width: 250px; background: #fff; border-right: 1px solid var(--line);
  padding: 18px 14px; display: flex; flex-direction: column; flex-shrink: 0;
}
.brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 22px; padding: 8px 8px 20px; }
.store-switcher {
  display: flex; align-items: center; gap: 10px; border: 1px solid var(--line); border-radius: 12px;
  padding: 10px 8px; margin-bottom: 24px; background: #fff;
}
.store-avatar, .profile-avatar { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; font-weight: 700; background: #f4d5b4; color: #a45d2f; }
.store-switcher b, .profile b { display: block; }
.store-switcher small, .profile small { display: block; color: var(--muted); font-size: 11px; }
.chevron { margin-left: auto; color: var(--muted); }
.nav-label { margin: 20px 10px 8px; font-size: 10px; letter-spacing: 1.2px; color: #95a3a0; text-transform: uppercase; font-weight: 700; }
.nav-item {
  width: 100%; display: flex; align-items: center; gap: 10px; border: 0; background: transparent;
  padding: 11px 12px; border-radius: 9px; color: #5c756f; text-align: left; margin: 2px 0;
}
.nav-item em { margin-left: auto; font-style: normal; font-size: 10px; background: #f0f5f2; padding: 2px 6px; border-radius: 10px; }
.nav-item.active, .nav-item:hover { background: var(--mint); color: var(--teal); font-weight: 600; }
.sidebar-bottom { margin-top: auto; }
.help-card { margin: 10px 0 16px; background: #f4faf7; border-radius: 12px; padding: 16px; }
.help-card strong { font-size: 12px; }
.help-card p { margin: 8px 0 12px; font-size: 11px; color: var(--muted); line-height: 1.5; }
.help-card button { background: none; border: 0; color: var(--teal); font-weight: 700; padding: 0; }
.profile { display: flex; align-items: center; gap: 10px; padding-top: 16px; border-top: 1px solid var(--line); }
.logout-btn { margin-left: auto; background: #f3f7f6; border: 0; border-radius: 7px; padding: 8px 10px; color: var(--ink); font-size: 11px; }
.dots { margin-left: auto; color: #a5b5b1; }
.main-content { flex:1; min-width:0; }
.topbar {
  display:flex; align-items:center; justify-content:space-between; background:#fff; border-bottom:1px solid var(--line);
  height:76px; padding:0 4%;
}
.breadcrumb { display:flex; gap:10px; align-items:center; color:#99a9a4; }
.breadcrumb strong { color: var(--ink); }
.top-actions { display:flex; align-items:center; gap:18px; }
.icon-btn { background:none; border:none; font-size:20px; color:#697d78; position:relative; }
.icon-btn i { position:absolute; right:2px; top:0; width:7px;height:7px;border-radius:50%;background:#f58055; }
.date-pill { color:#788d87; font-size:12px; }
.mobile-menu { display:none; background:none; border:none; font-size:22px; }
.content { padding: 30px 4%; }
.view { display:none; }
.view.active { display:block; }
.page-heading { display:flex; justify-content:space-between; align-items:flex-end; gap:16px; margin-bottom:22px; }
.eyebrow { font-size:10px; letter-spacing:1.2px; color:#9aa9a1; text-transform: uppercase; margin:0 0 8px; font-weight:700; }
.page-heading h1 { margin:0; font-size:28px; }
.subtitle { margin:8px 0 0; color:var(--muted); }
.primary-btn, .secondary-btn { border:0; border-radius:8px; padding: 11px 16px; font-weight:700; }
.primary-btn { background: var(--teal); color:#fff; }
.secondary-btn { background: #eef5f3; color: var(--teal); }
.stats-grid { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:16px; margin-bottom: 20px; }
.stat-card, .panel { background:#fff; border:1px solid var(--line); border-radius:12px; box-shadow: var(--shadow); }
.stat-card { padding:18px 20px; }
.stat-top { display:flex; justify-content:space-between; color:var(--muted); font-size:12px; margin-bottom:12px; }
.stat-icon { width:26px; height:26px; border-radius:8px; display:grid; place-items:center; font-weight:700; }
.green { background:#e7f5ef; color:#1b9a7a; }
.purple { background:#f0ecff; color:#8469d6; }
.orange { background:#fff0e8; color:#e88852; }
.red { background:#fff0ef; color:#ee756b; }
.stat-card strong { font-size: 22px; display:block; }
.stat-card p { margin:8px 0 0; font-size:11px; }
.positive { color:#169575; }
.warning { color:var(--muted); }
.dashboard-grid { display:grid; grid-template-columns: 1.6fr 1fr; gap:20px; margin-bottom: 20px; }
.bottom-grid { display:grid; grid-template-columns: 1.3fr 1fr; gap:20px; }
.panel { padding: 18px 20px; }
.panel-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
.panel h2 { margin:0; font-size:15px; }
.panel-heading p { margin:5px 0 0; color:var(--muted); font-size:11px; }
.table-wrap { overflow-x:auto; }
table { width:100%; min-width:560px; border-collapse:collapse; margin-top:16px; }
th { text-align:left; font-size:9px; letter-spacing:1px; color:#9aa9a1; text-transform:uppercase; padding:0 10px 12px; border-bottom:1px solid var(--line); }
td { padding:12px 10px; border-bottom:1px solid #edf2f0; }
.status { display:inline-block; padding:4px 8px; border-radius:12px; font-size:10px; font-weight:700; }
.status.low { background:#fff1eb; color:#d96c4e; }
.status.good { background:#e9f7f1; color:#19896f; }
.stock-bar { display:inline-block; width:80px; height:5px; background:#eef1ef; border-radius:10px; margin-right:6px; }
.stock-bar i { display:block; height:100%; border-radius:10px; background:#f28b65; }
.toolbar { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:16px 20px; border-bottom:1px solid var(--line); }
.search { width: 250px; display:flex; align-items:center; gap:8px; border:1px solid var(--line); border-radius:8px; padding:8px 10px; }
.search input, .toolbar select, .form-grid input, .form-grid select { width:100%; border:1px solid var(--line); border-radius:7px; background:#fff; padding:10px; }
.search input { border:0; padding:0; outline:0; }
.form-grid { display:grid; grid-template-columns: 1fr 1fr; gap:14px; }
.form-grid label { display:block; color:#6b7d79; font-size:11px; font-weight:700; }
.form-grid input, .form-grid select { margin-top:7px; }
.form-panel { padding: 20px; }
.actions-row { display:flex; gap:10px; justify-content:space-between; margin-top:16px; }
.quick-actions { display:flex; flex-direction:column; gap:10px; margin-top:20px; }
.quick-actions button { display:flex; align-items:center; gap:10px; width:100%; background:transparent; border-bottom:1px solid var(--line); padding:10px 0; text-align:left; }
.quick-actions button:last-child { border-bottom:0; }
.action-icon { width:32px; height:32px; border-radius:8px; display:grid; place-items:center; font-size:18px; }
.teal { background:#e7f6f0; color:#159574; }
.blue { background:#ebf2ff; color:#5a82d7; }
.yellow { background:#fff5dc; color:#dc9a25; }
.toast {
  position:fixed; right:24px; bottom:20px; background:#173d35; color:#fff; padding:12px 16px; border-radius:8px;
  box-shadow: var(--shadow); transform: translateY(120px); transition: .3s; font-size:12px; display:flex; align-items:center; gap:8px;
}
.toast.show { transform: translateY(0); }
.toast span { color:#72d4b8; }
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(16, 41, 35, 0.7); display: grid; place-items: center; padding: 20px; z-index: 30;
}
.modal {
  background: white; width: min(92vw, 520px); border-radius: 16px; padding: 24px; position: relative;
}
.close-modal { position: absolute; top: 12px; right: 14px; border: 0; background: transparent; font-size: 26px; }
@media (max-width: 980px) { .sidebar { position:fixed; z-index:4; transform:translateX(-100%); transition:.2s; height:100%; } .sidebar.open { transform:translateX(0); } .mobile-menu { display:block; } .dashboard-grid, .bottom-grid, .stats-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 640px) { .stats-grid, .dashboard-grid, .bottom-grid, .form-grid { grid-template-columns: 1fr; } .page-heading { flex-direction:column; align-items:flex-start; } .toolbar { flex-direction:column; align-items:stretch; } .search { width:100%; } }
