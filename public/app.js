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
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }
.hidden { display: none !important; }
.login-shell {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0d6b5b, #1c2d2b);
}
.login-card {
  width: min(90vw, 430px);
  background: white;
  border-radius: 18px;
  padding: 28px;
  box-shadow: 0 28px 60px rgba(0,0,0,0.2);
}
.brand-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.logo {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--teal);
  color: white;
  font-weight: 700;
}
.brand-row strong {
  font-size: 28px;
}
.brand-row strong span { color: #16a878; }
.eyebrow {
  font-size: 10px;
  letter-spacing: 1.3px;
  color: var(--muted);
  text-transform: uppercase;
  margin: 0 0 6px;
  font-weight: 700;
}
.login-card h1 {
  margin: 0 0 18px;
  font-size: 30px;
}
.login-card label {
  display: block;
  margin: 14px 0;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}
.login-card input {
  width: 100%;
  margin-top: 6px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 12px 10px;
}
.full { width: 100%; }
.primary-btn, .secondary-btn {
  border: 0;
  border-radius: 8px;
  padding: 11px 16px;
  font-weight: 700;
}
.primary-btn {
  background: var(--teal);
  color: white;
}
.secondary-btn {
  background: #edf5f2;
  color: var(--teal);
}
.app-shell {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  padding: 18px 14px;
  position: relative;
}
.top-brand {
  padding: 6px 8px 18px;
}
.store-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px 8px;
  margin: 10px 0 18px;
}
.store-chip strong,
.user-box strong { display: block; }
.store-chip small,
.user-box small { display: block; font-size: 11px; color: var(--muted); }
.icon-box {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-weight: 700;
}
.store-icon { background: #fbe7d5; color: #b86c2a; }
.user-icon { background: #e8f6ef; color: #14896d; }
.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 10px;
}
.nav-label {
  margin: 18px 10px 8px;
  font-size: 10px;
  letter-spacing: 1.2px;
  color: #9aa8a3;
  text-transform: uppercase;
  font-weight: 700;
}
.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: 0;
  border-radius: 10px;
  padding: 11px 12px;
  text-align: left;
  color: #5f736e;
  font-weight: 600;
}
.nav-item.active,
.nav-item:hover {
  background: var(--mint);
  color: var(--teal);
}
.nav-item span {
  background: #eef3f1;
  border-radius: 11px;
  font-size: 10px;
  padding: 2px 6px;
}
.sidebar-footer {
  margin-top: auto;
}
.help-box {
  background: #f4faf7;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 14px;
}
.help-box p {
  margin: 8px 0 12px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
}
.help-box button {
  background: none;
  border: 0;
  color: var(--teal);
  font-weight: 700;
  padding: 0;
}
.user-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}
.logout-btn {
  margin-left: auto;
  background: #edf4f1;
  border: 0;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 11px;
}
.main-panel {
  flex: 1;
  min-width: 0;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-bottom: 1px solid var(--line);
  padding: 0 28px;
  height: 76px;
}
.top-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.mobile-menu {
  display: none;
  background: transparent;
  border: 0;
  font-size: 22px;
}
.crumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 13px;
}
.crumbs strong {
  color: var(--ink);
}
.top-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.icon-btn {
  border: 0;
  background: transparent;
  font-size: 20px;
}
.date-pill {
  background: #f4f7f6;
  border-radius: 999px;
  padding: 7px 12px;
  color: var(--muted);
  font-size: 12px;
}
.content {
  padding: 26px 28px 36px;
}
.view { display: none; }
.view.active { display: block; }
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
.page-header h1 {
  margin: 0;
  font-size: 30px;
}
.subtitle {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 13px;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 20px;
}
.stat-card, .panel, .table-panel {
  background: white;
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: var(--shadow);
}
.stat-card {
  padding: 18px 20px;
}
.stat-card .top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--muted);
  font-size: 12px;
}
.stat-card strong {
  display: block;
  margin-top: 16px;
  font-size: 26px;
}
.icon-badge {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 15px;
}
.mint { background: #eaf7f1; color: #1f9a7b; }
.purple { background: #f0ebff; color: #7d6ed2; }
.orange { background: #fff1e7; color: #e88d58; }
.red { background: #fff0ed; color: #df645f; }
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 20px;
}
.panel, .table-panel {
  padding: 18px 20px;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.panel-header h2 {
  margin: 0;
  font-size: 18px;
}
.panel-sub {
  color: var(--muted);
  font-size: 11px;
}
.table-wrap { overflow-x: auto; }
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 560px;
}
th {
  text-align: left;
  padding: 0 10px 12px;
  color: #9aa9a2;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid var(--line);
}
td {
  padding: 12px 10px;
  border-bottom: 1px solid #edf2f0;
  font-size: 13px;
}
.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
}
.status.low { background: #fff0eb; color: #d66a4d; }
.status.good { background: #e8f8f1; color: #16906d; }
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: white;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  border-radius: 9px;
  padding: 8px 10px;
  width: min(60%, 320px);
}
.search-box input {
  border: 0;
  width: 100%;
  outline: none;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-grid label {
  display: block;
  font-size: 12px;
  color: var(--muted);
  font-weight: 700;
}
.form-grid input,
.form-grid select,
.form-grid textarea {
  width: 100%;
  margin-top: 7px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px;
}
.form-grid textarea {
  min-height: 90px;
}
.actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-top: 20px;
}
.quick-actions { display: flex; flex-direction: column; gap: 10px; }
.quick-action {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 0;
  background: transparent;
  border-bottom: 1px solid var(--line);
  padding: 10px 0;
  text-align: left;
}
.quick-action:last-child { border-bottom: 0; }
.quick-action strong { display: block; }
.quick-action small { display: block; color: var(--muted); }
.quick-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-weight: 700;
}
.turquoise { background: #e7f6f1; color: #17a578; }
.blue { background: #ebf2ff; color: #5a80d7; }
.gold { background: #fff4db; color: #d88d2f; }
.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  background: #123d36;
  color: white;
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: var(--shadow);
  transform: translateY(130px);
  transition: 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}
.toast.show { transform: translateY(0); }
.toast span { color: #7ee0bf; }
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(14, 31, 29, 0.6);
  display: grid;
  place-items: center;
  padding: 22px;
  z-index: 50;
}
.modal {
  width: min(92vw, 560px);
  background: white;
  border-radius: 16px;
  padding: 24px;
  position: relative;
}
.close-btn {
  position: absolute;
  top: 12px;
  right: 14px;
  border: 0;
  background: transparent;
  font-size: 26px;
}
@media (max-width: 980px) {
  .sidebar {
    position: fixed;
    z-index: 10;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }
  .sidebar.open { transform: translateX(0); }
  .mobile-menu { display: block; }
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dashboard-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .content { padding: 18px; }
  .page-header { flex-direction: column; align-items: flex-start; }
  .stats-grid, .form-grid { grid-template-columns: 1fr; }
  .toolbar { flex-direction: column; align-items: stretch; }
  .search-box { width: 100%; }
}
