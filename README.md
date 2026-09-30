const state = {
  user: null,
  activeView: 'dashboard',
  dashboard: null,
  products: [],
  sales: [],
  customers: [],
  suppliers: [],
  purchases: [],
  expenses: [],
  reports: null,
  settings: null,
};

const $ = (selector) => document.querySelector(selector);
const money = (value) => `${new Intl.NumberFormat('en-US').format(Number(value || 0))} FCFA`;
const esc = (str) => String(str ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
}[char]));

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'API request failed');
  return data;
}

function toast(message) {
  const el = $('#toast');
  el.innerHTML = `${message} <span>✓</span>`;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2800);
}

function updateHeader() {
  const s = state.settings || {};
  $('#store-name').textContent = s.storeName || 'Petit Marché';
  $('#store-city').textContent = s.city || 'Douala';
  $('#owner-name').textContent = state.user?.name || 'Amélie N.';
  $('#owner-role').textContent = state.user?.role || 'Owner';
  $('#product-count').textContent = state.products.length;
}

function showView(view) {
  state.activeView = view;
  document.querySelectorAll('.view').forEach((el) => el.classList.toggle('active', el.id === `${view}-view`));
  document.querySelectorAll('.nav-item').forEach((el) => el.classList.toggle('active', el.dataset.view === view));
  $('#page-title').textContent = view.charAt(0).toUpperCase() + view.slice(1);
  $('#sidebar').classList.remove('open');
  renderView();
}

function renderView() {
  switch (state.activeView) {
    case 'dashboard': renderDashboard(); break;
    case 'products': renderProducts(); break;
    case 'sales': renderSales(); break;
    case 'customers': renderCustomers(); break;
    case 'suppliers': renderSuppliers(); break;
    case 'purchases': renderPurchases(); break;
    case 'reports': renderReports(); break;
    case 'settings': renderSettings(); break;
    default: renderDashboard();
  }
}

function statCard(title, value, icon, badgeClass = 'mint') {
  return `
    <article class="stat-card">
      <div class="top">
        <span>${title}</span>
        <span class="icon-badge ${badgeClass}">${icon}</span>
      </div>
      <strong>${value}</strong>
    </article>
  `;
}

function renderDashboard() {
  const d = state.dashboard || {};
  const lowStockRows = (d.lowStock || []).slice(0, 5).map((p) => `
    <tr>
      <td>${esc(p.name)}</td>
      <td><span class="status low">${p.stock} left</span></td>
    </tr>
  `).join('');

  $('#dashboard-view').innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Overview</p>
        <h1>MboaStock dashboard</h1>
        <p class="subtitle">A quick view of sales, stock, and operations.</p>
      </div>
    </div>

    <div class="stats-grid">
      ${statCard('Total Sales', money(d.totalSales), '↗', 'mint')}
      ${statCard('Net Revenue', money(d.netRevenue), '↑', 'purple')}
      ${statCard('Expenses', money(d.totalExpenses), '↓', 'orange')}
      ${statCard('Low Stock', d.lowStockCount || 0, '⚠', 'red')}
    </div>

    <div class="dashboard-grid">
      <div class="panel">
        <div class="panel-header">
          <h2>Low stock alert</h2>
          <span class="panel-sub">Restock soon</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Product</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${lowStockRows || '<tr><td colspan="2">No low-stock alerts</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h2>Quick actions</h2>
          <span class="panel-sub">Common tasks</span>
        </div>
        <div class="quick-actions">
          <button class="quick-action" data-action="quick-sale">
            <span class="quick-icon turquoise">⬇</span>
            <span>
              <strong>Record sale</strong>
              <small>Add a new transaction</small>
            </span>
          </button>
          <button class="quick-action" data-action="quick-product">
            <span class="quick-icon blue">＋</span>
            <span>
              <strong>Add product</strong>
              <small>New inventory item</small>
            </span>
          </button>
          <button class="quick-action" data-action="quick-purchase">
            <span class="quick-icon gold">◫</span>
            <span>
              <strong>New purchase</strong>
              <small>Order from supplier</small>
            </span>
          </button>
        </div>
      </div>
    </div>
  `;

  bindQuickActions();
}

function renderProducts() {
  $('#products-view').innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Catalog</p>
        <h1>Products</h1>
        <p class="subtitle">Inventory and pricing overview.</p>
      </div>
      <button class="primary-btn" data-action="add-product">+ Add product</button>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <span>⌕</span>
        <input id="product-search" placeholder="Search products..." />
      </div>
    </div>

    <div class="table-panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Reorder</th><th>Status</th></tr>
          </thead>
          <tbody id="product-rows"></tbody>
        </table>
      </div>
    </div>
  `;

  const rows = state.products.filter((p) => p.name.toLowerCase().includes((document.getElementById('product-search')?.value || '').toLowerCase()));
  $('#product-rows').innerHTML = rows.map((p) => {
    const statusText = Number(p.stock) <= Number(p.reorder) ? 'Low stock' : 'In stock';
    const statusClass = statusText === 'Low stock' ? 'low' : 'good';
    return `
      <tr>
        <td>${esc(p.name)}</td>
        <td>${esc(p.category)}</td>
        <td>${money(p.price)}</td>
        <td>${p.stock}</td>
        <td>${p.reorder}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="6">No products found</td></tr>';

  $('#product-search')?.addEventListener('input', () => renderProducts());
  bindActions();
}

function renderSales() {
  $('#sales-view').innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Transactions</p>
        <h1>Sales</h1>
        <p class="subtitle">Track every completed sale.</p>
      </div>
      <button class="primary-btn" data-action="add-sale">+ Record sale</button>
    </div>

    <div class="table-panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Reference</th><th>Date</th><th>Customer</th><th>Payment</th><th>Total</th><th>Receipt</th></tr>
          </thead>
          <tbody>
            ${state.sales.map((sale) => `
              <tr>
                <td>${esc(sale.reference)}</td>
                <td>${sale.date}</td>
                <td>${esc(sale.customer)}</td>
                <td>${esc(sale.payment)}</td>
                <td>${money(sale.total)}</td>
                <td><button class="secondary-btn" data-action="print-receipt" data-id="${sale.id}" style="padding:6px 10px; font-size:11px;">Print</button></td>
              </tr>
            `).join('') || '<tr><td colspan="6">No sales yet</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  bindActions();
}

function renderCustomers() {
  $('#customers-view').innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Customers</p>
        <h1>Customer directory</h1>
        <p class="subtitle">Keep contact details and loyalty data.</p>
      </div>
      <button class="primary-btn" data-action="add-customer">+ Add customer</button>
    </div>

    <div class="table-panel">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Phone</th><th>Loyalty</th></tr></thead>
          <tbody>
            ${state.customers.map((c) => `
              <tr>
                <td>${esc(c.name)}</td>
                <td>${esc(c.phone)}</td>
                <td>${esc(c.loyalty)}</td>
              </tr>
            `).join('') || '<tr><td colspan="3">No customers yet</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  bindActions();
}

function renderSuppliers() {
  $('#suppliers-view').innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Suppliers</p>
        <h1>Supplier directory</h1>
        <p class="subtitle">Manage your product suppliers.</p>
      </div>
      <button class="primary-btn" data-action="add-supplier">+ Add supplier</button>
    </div>

    <div class="table-panel">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Phone</th><th>Contact</th></tr></thead>
          <tbody>
            ${state.suppliers.map((s) => `
              <tr>
                <td>${esc(s.name)}</td>
                <td>${esc(s.phone)}</td>
                <td>${esc(s.contact)}</td>
              </tr>
            `).join('') || '<tr><td colspan="3">No suppliers yet</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  bindActions();
}

function renderPurchases() {
  $('#purchases-view').innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Purchases</p>
        <h1>Purchase orders</h1>
        <p class="subtitle">Track supplier orders and status.</p>
      </div>
      <button class="primary-btn" data-action="add-purchase">+ Create purchase</button>
    </div>

    <div class="table-panel">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Reference</th><th>Supplier</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            ${state.purchases.map((p) => {
              const supplier = state.suppliers.find((s) => s.id === p.supplier_id);
              return `
                <tr>
                  <td>${esc(p.reference)}</td>
                  <td>${esc(supplier?.name || 'Unknown')}</td>
                  <td>${p.date}</td>
                  <td>${money(p.total)}</td>
                  <td><span class="status ${p.status === 'Received' ? 'good' : 'low'}">${p.status}</span></td>
                </tr>
              `;
            }).join('') || '<tr><td colspan="5">No purchases yet</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  bindActions();
}

function renderReports() {
  const r = state.reports || {};
  $('#reports-view').innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Analytics</p>
        <h1>Reports</h1>
        <p class="subtitle">Operational and financial overview.</p>
      </div>
    </div>

    <div class="stats-grid">
      ${statCard('Sales', money(r.salesTotal), '↗', 'mint')}
      ${statCard('Expenses', money(r.expenseTotal), '↓', 'orange')}
      ${statCard('Net', money(r.net), '≈', 'purple')}
    </div>

    <div class="panel">
      <div class="panel-header">
        <h2>Sales by payment method</h2>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Method</th><th>Count</th><th>Total</th></tr></thead>
          <tbody>
            ${(r.salesByPayment || []).map((row) => `
              <tr>
                <td>${esc(row.payment)}</td>
                <td>${row.count}</td>
                <td>${money(row.total)}</td>
              </tr>
            `).join('') || '<tr><td colspan="3">No data</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSettings() {
  const s = state.settings || {};
  $('#settings-view').innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Preferences</p>
        <h1>Store settings</h1>
        <p class="subtitle">Update store identity and contact information.</p>
      </div>
    </div>

    <div class="panel">
      <form id="settings-form">
        <div class="form-grid">
          <label>
            Store name
            <input name="storeName" value="${esc(s.storeName || '')}" />
          </label>
          <label>
            City
            <input name="city" value="${esc(s.city || '')}" />
          </label>
          <label>
            Currency
            <input name="currency" value="${esc(s.currency || '')}" />
          </label>
          <label>
            Language
            <select name="language">
              <option value="English" ${s.language === 'English' ? 'selected' : ''}>English</option>
              <option value="French" ${s.language === 'French' ? 'selected' : ''}>French</option>
            </select>
          </label>
          <label style="grid-column: 1 / -1;">
            Phone
            <input name="phone" value="${esc(s.phone || '')}" />
          </label>
        </div>

        <div class="actions-row">
          <button type="submit" class="primary-btn">Save settings</button>
        </div>
      </form>
    </div>
  `;

  $('#settings-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const payload = Object.fromEntries(form.entries());

    try {
      await api('/api/settings', { method: 'PUT', body: JSON.stringify(payload) });
      toast('Settings saved');
      await loadAll();
    } catch (error) {
      toast(error.message);
    }
  });
}

function modal(title, fields, onSubmit) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <button class="close-btn" type="button" aria-label="Close">×</button>
      <p class="eyebrow">Add</p>
      <h2>${title}</h2>
      <form>
        <div class="form-grid">
          ${fields}
        </div>
        <div class="actions-row">
          <button type="button" class="secondary-btn close-modal">Cancel</button>
          <button type="submit" class="primary-btn">Save</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(backdrop);

  backdrop.querySelector('.close-btn').addEventListener('click', () => backdrop.remove());
  backdrop.querySelector('.close-modal').addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) backdrop.remove();
  });

  backdrop.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const payload = Object.fromEntries(form.entries());

    try {
      await onSubmit(payload);
      backdrop.remove();
      toast('Saved successfully');
      await loadAll();
    } catch (error) {
      toast(error.message);
    }
  });
}

function openAddDialog(type) {
  if (type === 'product') {
    modal('Add product', `
      <label>Name<input name="name" required /></label>
      <label>Category<input name="category" value="Groceries" /></label>
      <label>Price<input name="price" type="number" min="0" required /></label>
      <label>Stock<input name="stock" type="number" min="0" required /></label>
      <label>Reorder level<input name="reorder" type="number" min="0" required /></label>
    `, async (payload) => api('/api/products', { method: 'POST', body: JSON.stringify(payload) }));
  }

  if (type === 'sale') {
    modal('Record sale', `
      <label>Product<select name="selectedProductId">${state.products.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>
      <label>Quantity<input name="quantity" type="number" min="1" required /></label>
      <label>Payment<select name="payment"><option>Cash</option><option>Mobile Money</option><option>Card</option></select></label>
      <label>Customer<input name="customer" placeholder="Walk-in customer" /></label>
    `, async (payload) => api('/api/sales', { method: 'POST', body: JSON.stringify(payload) }));
  }

  if (type === 'customer') {
    modal('Add customer', `
      <label>Name<input name="name" required /></label>
      <label>Phone<input name="phone" /></label>
      <label>Loyalty<select name="loyalty"><option>Bronze</option><option>Silver</option><option>Gold</option></select></label>
    `, async (payload) => api('/api/customers', { method: 'POST', body: JSON.stringify(payload) }));
  }

  if (type === 'supplier') {
    modal('Add supplier', `
      <label>Name<input name="name" required /></label>
      <label>Phone<input name="phone" /></label>
      <label>Contact<input name="contact" /></label>
    `, async (payload) => api('/api/suppliers', { method: 'POST', body: JSON.stringify(payload) }));
  }

  if (type === 'purchase') {
    modal('Create purchase order', `
      <label>Supplier<select name="supplier_id">${state.suppliers.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label>
      <label>Notes<textarea name="notes"></textarea></label>
      <label>Item list<textarea name="items" placeholder='[{"name":"Rice","quantity":10,"price":15000}]'></textarea></label>
    `, async (payload) => {
      let items = [];
      try {
        items = payload.items ? JSON.parse(payload.items) : [];
      } catch (error) {
        throw new Error('Invalid JSON item list');
      }
      return api('/api/purchases', { method: 'POST', body: JSON.stringify({ ...payload, items }) });
    });
  }
}

function bindQuickActions() {
  document.querySelectorAll('[data-action="quick-sale"]').forEach((btn) => btn.addEventListener('click', () => openAddDialog('sale')));
  document.querySelectorAll('[data-action="quick-product"]').forEach((btn) => btn.addEventListener('click', () => openAddDialog('product')));
  document.querySelectorAll('[data-action="quick-purchase"]').forEach((btn) => btn.addEventListener('click', () => openAddDialog('purchase')));
}

function bindActions() {
  document.querySelectorAll('[data-action="add-product"]').forEach((btn) => btn.addEventListener('click', () => openAddDialog('product')));
  document.querySelectorAll('[data-action="add-sale"]').forEach((btn) => btn.addEventListener('click', () => openAddDialog('sale')));
  document.querySelectorAll('[data-action="add-customer"]').forEach((btn) => btn.addEventListener('click', () => openAddDialog('customer')));
  document.querySelectorAll('[data-action="add-supplier"]').forEach((btn) => btn.addEventListener('click', () => openAddDialog('supplier')));
  document.querySelectorAll('[data-action="add-purchase"]').forEach((btn) => btn.addEventListener('click', () => openAddDialog('purchase')));
  document.querySelectorAll('[data-action="print-receipt"]').forEach((btn) => {
    btn.addEventListener('click', () => window.open(`/api/receipt/${btn.dataset.id}`, '_blank'));
  });

  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  });
}

async function loadAll() {
  try {
    const [dashboard, products, sales, customers, suppliers, purchases, expenses, reports, settings] = await Promise.all([
      api('/api/dashboard'),
      api('/api/products'),
      api('/api/sales'),
      api('/api/customers'),
      api('/api/suppliers'),
      api('/api/purchases'),
      api('/api/expenses'),
      api('/api/reports'),
      api('/api/settings')
    ]);

    state.dashboard = dashboard;
    state.products = products;
    state.sales = sales;
    state.customers = customers;
    state.suppliers = suppliers;
    state.purchases = purchases;
    state.expenses = expenses;
    state.reports = reports;
    state.settings = settings;

    updateHeader();
    renderView();
  } catch (error) {
    toast(error.message);
  }
}

async function loginUser(email, password) {
  try {
    const result = await api('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (result.ok) {
      state.user = result.user;
      $('#login-shell').classList.add('hidden');
      $('#app-shell').classList.remove('hidden');
      updateHeader();
      await loadAll();
    }
  } catch (error) {
    toast(error.message);
  }
}

function logout() {
  state.user = null;
  $('#app-shell').classList.add('hidden');
  $('#login-shell').classList.remove('hidden');
  $('#login-form').reset();
}

function bindAuth() {
  $('#login-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const email = form.get('email');
    const password = form.get('password');
    loginUser(email, password);
  });

  $('#logout-btn')?.addEventListener('click', logout);
  $('#mobile-menu')?.addEventListener('click', () => $('#sidebar').classList.toggle('open'));
}

function init() {
  $('#today-date').textContent = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  bindAuth();
}

init();

setTimeout(() => {
  const loginForm = $('#login-form');
  if (loginForm) loginForm.dispatchEvent(new Event('submit', { cancelable: true }));
}, 100);

