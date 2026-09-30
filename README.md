const state = {
  activeView: 'dashboard',
  user: null,
  dashboard: null,
  products: [],
  sales: [],
  customers: [],
  suppliers: [],
  purchases: [],
  expenses: [],
  reports: null,
  settings: null
};

const $ = (selector) => document.querySelector(selector);
const money = (value) => `${new Intl.NumberFormat('en-US').format(Number(value || 0))} FCFA`;
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
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
  if (!response.ok) throw new Error(data.message || 'API error');
  return data;
}

function toast(message) {
  const el = $('#toast');
  el.innerHTML = `<span>✓</span> ${message}`;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2600);
}

function showView(view) {
  state.activeView = view;
  document.querySelectorAll('.view').forEach((el) => {
    el.classList.toggle('active', el.id === `${view}-view`);
  });
  document.querySelectorAll('.nav-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.view === view);
  });
  $('#page-title').textContent = view.charAt(0).toUpperCase() + view.slice(1);
  renderCurrent();
}

function renderCurrent() {
  if (state.activeView === 'dashboard') renderDashboard();
  if (state.activeView === 'products') renderProducts();
  if (state.activeView === 'sales') renderSales();
  if (state.activeView === 'customers') renderCustomers();
  if (state.activeView === 'suppliers') renderSuppliers();
  if (state.activeView === 'purchases') renderPurchases();
  if (state.activeView === 'expenses') renderExpenses();
  if (state.activeView === 'reports') renderReports();
  if (state.activeView === 'settings') renderSettings();
}

function statCard(title, value, icon = '↗') {
  return `
    <article class="stat-card">
      <div class="stat-top">
        <span>${title}</span>
        <span class="stat-icon green">${icon}</span>
      </div>
      <strong>${value}</strong>
    </article>
  `;
}

function renderDashboard() {
  const d = state.dashboard || {};
  const lowStockRows = (d.lowStock || []).slice(0, 5).map((p) => `
    <tr>
      <td>${escapeHtml(p.name)}</td>
      <td><span class="status low">${p.stock} left</span></td>
    </tr>
  `).join('');

  $('#dashboard-view').innerHTML = `
    <div class="page-heading">
      <div>
        <p class="eyebrow">OVERVIEW</p>
        <h1>Good morning! ✦</h1>
        <p class="subtitle">Here's your store performance.</p>
      </div>
    </div>
    <div class="stats-grid">
      ${statCard('Total Sales', money(d.totalSales || 0))}
      ${statCard('Net Revenue', money(d.netRevenue || 0), '↑')}
      ${statCard('Expenses', money(d.totalExpenses || 0), '↓')}
      ${statCard('Low Stock Items', d.lowStockCount || 0, '⚠')}
    </div>
    <div class="dashboard-grid">
      <article class="panel">
        <div class="panel-heading">
          <h2>Low Stock Alert</h2>
          <p>Products that need restocking</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Product</th><th>Status</th></tr></thead>
            <tbody>
              ${lowStockRows || '<tr><td colspan="2" style="text-align:center;color:#a8b6b2;">All products well stocked 🎉</td></tr>'}
            </tbody>
          </table>
        </div>
      </article>
      <article class="panel">
        <div class="panel-heading">
          <h2>Quick Actions</h2>
          <p>Common tasks</p>
        </div>
        <div class="quick-actions">
          <button data-action="quick-sale"><span class="action-icon teal">↓</span><div><b>Record Sale</b><small>Add a transaction</small></div></button>
          <button data-action="quick-product"><span class="action-icon blue">+</span><div><b>Add Product</b><small>New inventory item</small></div></button>
          <button data-action="quick-purchase"><span class="action-icon yellow">📦</span><div><b>New Purchase Order</b><small>From supplier</small></div></button>
        </div>
      </article>
    </div>
  `;
  bindActions();
}

function renderProducts() {
  const rows = state.products.map((p) => {
    const status = Number(p.stock) <= Number(p.reorder) ? 'Low stock' : 'In stock';
    return `
      <tr>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.category)}</td>
        <td>${money(p.price)}</td>
        <td>${p.stock}</td>
        <td>${p.reorder}</td>
        <td><span class="status ${status === 'Low stock' ? 'low' : 'good'}">${status}</span></td>
      </tr>
    `;
  }).join('');

  $('#products-view').innerHTML = `
    <div class="page-heading">
      <div>
        <p class="eyebrow">CATALOG</p>
        <h1>Products</h1>
        <p class="subtitle">Track stock and pricing.</p>
      </div>
      <button class="primary-btn" data-action="add-product">+ Add Product</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Reorder</th><th>Status</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#a8b6b2;">No products available</td></tr>'}</tbody>
      </table>
    </div>
  `;
  bindActions();
}

function renderSales() {
  const rows = state.sales.map((s) => `
    <tr>
      <td><strong>${escapeHtml(s.reference)}</strong></td>
      <td>${s.date}</td>
      <td>${escapeHtml(s.customer)}</td>
      <td>${escapeHtml(s.payment)}</td>
      <td>${money(s.total)}</td>
      <td><button class="secondary-btn" data-action="print-receipt" data-id="${s.id}" style="padding:6px 12px;font-size:11px;">🖨️ Print</button></td>
    </tr>
  `).join('');

  $('#sales-view').innerHTML = `
    <div class="page-heading">
      <div><p class="eyebrow">TRANSACTIONS</p><h1>Sales</h1><p class="subtitle">Track all transactions.</p></div>
      <button class="primary-btn" data-action="add-sale">+ Record Sale</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Reference</th><th>Date</th><th>Customer</th><th>Payment</th><th>Total</th><th>Action</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#a8b6b2;">No sales yet</td></tr>'}</tbody>
      </table>
    </div>
  `;
  bindActions();
}

function renderCustomers() {
  const rows = state.customers.map((c) => `
    <tr><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.phone)}</td><td>${escapeHtml(c.loyalty)}</td></tr>
  `).join('');

  $('#customers-view').innerHTML = `
    <div class="page-heading">
      <div><p class="eyebrow">CONTACTS</p><h1>Customers</h1><p class="subtitle">Keep your customer directory organized.</p></div>
      <button class="primary-btn" data-action="add-customer">+ Add Customer</button>
    </div>
    <div class="table-wrap">
      <table><thead><tr><th>Name</th><th>Phone</th><th>Loyalty</th></tr></thead><tbody>${rows || '<tr><td colspan="3" style="text-align:center;color:#a8b6b2;">No customers yet</td></tr>'}</tbody></table>
    </div>
  `;
  bindActions();
}

function renderSuppliers() {
  const rows = state.suppliers.map((s) => `
    <tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.phone)}</td><td>${escapeHtml(s.contact)}</td></tr>
  `).join('');

  $('#suppliers-view').innerHTML = `
    <div class="page-heading">
      <div><p class="eyebrow">PARTNERS</p><h1>Suppliers</h1><p class="subtitle">Track your purchase partners.</p></div>
      <button class="primary-btn" data-action="add-supplier">+ Add Supplier</button>
    </div>
    <div class="table-wrap">
      <table><thead><tr><th>Name</th><th>Phone</th><th>Contact</th></tr></thead><tbody>${rows || '<tr><td colspan="3" style="text-align:center;color:#a8b6b2;">No suppliers yet</td></tr>'}</tbody></table>
    </div>
  `;
  bindActions();
}

function renderPurchases() {
  const rows = state.purchases.map((purchase) => `
    <tr>
      <td>${escapeHtml(purchase.reference)}</td>
      <td>${purchase.date}</td>
      <td>${escapeHtml(purchase.status)}</td>
      <td>${money(purchase.total)}</td>
      <td>
        <select data-purchase-status="${purchase.id}">
          <option value="Pending" ${purchase.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Received" ${purchase.status === 'Received' ? 'selected' : ''}>Received</option>
          <option value="Cancelled" ${purchase.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
    </tr>
  `).join('');

  $('#purchases-view').innerHTML = `
    <div class="page-heading">
      <div><p class="eyebrow">PROCUREMENT</p><h1>Purchases</h1><p class="subtitle">Supplier purchase tracking.</p></div>
      <button class="primary-btn" data-action="add-purchase">+ New Purchase</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Reference</th><th>Date</th><th>Status</th><th>Total</th><th>Update</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5" style="text-align:center;color:#a8b6b2;">No purchases yet</td></tr>'}</tbody>
      </table>
    </div>
  `;

  document.querySelectorAll('[data-purchase-status]').forEach((select) => {
    select.addEventListener('change', async (event) => {
      const id = event.target.dataset.purchaseStatus;
      const status = event.target.value;
      try {
        await api(`/api/purchases/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
        toast('Purchase status updated');
        await refresh();
      } catch (error) {
        toast(error.message);
      }
    });
  });

  bindActions();
}

function renderExpenses() {
  const rows = state.expenses.map((expense) => `
    <tr>
      <td>${escapeHtml(expense.label)}</td>
      <td>${escapeHtml(expense.category)}</td>
      <td>${money(expense.amount)}</td>
      <td>${expense.date}</td>
    </tr>
  `).join('');

  $('#expenses-view').innerHTML = `
    <div class="page-heading">
      <div><p class="eyebrow">CASHFLOW</p><h1>Expenses</h1><p class="subtitle">Track business expenses.</p></div>
      <button class="primary-btn" data-action="add-expense">+ Add Expense</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Label</th><th>Category</th><th>Amount</th><th>Date</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4" style="text-align:center;color:#a8b6b2;">No expenses recorded</td></tr>'}</tbody>
      </table>
    </div>
  `;
  bindActions();
}

function renderReports() {
  const r = state.reports || {};
  const payments = (r.salesByPayment || []).map((row) => `
    <tr><td>${escapeHtml(row.payment)}</td><td>${row.count}</td><td>${money(row.total || 0)}</td></tr>
  `).join('');

  $('#reports-view').innerHTML = `
    <div class="page-heading">
      <div><p class="eyebrow">ANALYTICS</p><h1>Reports</h1><p class="subtitle">Business performance overview.</p></div>
    </div>
    <div class="stats-grid">
      ${statCard('Total Sales', money(r.salesTotal || 0))}
      ${statCard('Total Expenses', money(r.expenseTotal || 0), '↓')}
      ${statCard('Net Profit', money(r.net || 0), '↗')}
    </div>
    <div class="panel" style="margin-top:20px;">
      <div class="panel-heading"><h2>Sales by Payment Method</h2></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Method</th><th>Count</th><th>Total</th></tr></thead>
          <tbody>${payments || '<tr><td colspan="3" style="text-align:center;color:#a8b6b2;">No payment data yet</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSettings() {
  const s = state.settings || {};
  $('#settings-view').innerHTML = `
    <div class="page-heading">
      <div><p class="eyebrow">PREFERENCES</p><h1>Settings</h1><p class="subtitle">Configure your store.</p></div>
    </div>
    <div style="max-width:650px;">
      <form id="settings-form" class="form-panel">
        <div class="form-grid">
          <label>Store Name<input type="text" name="storeName" value="${escapeHtml(s.storeName || '')}" /></label>
          <label>City<input type="text" name="city" value="${escapeHtml(s.city || '')}" /></label>
          <label>Currency<input type="text" name="currency" value="${escapeHtml(s.currency || '')}" /></label>
          <label>Language<select name="language">
            <option value="English" ${s.language === 'English' ? 'selected' : ''}>English</option>
            <option value="French" ${s.language === 'French' ? 'selected' : ''}>Français</option>
          </select></label>
          <label style="grid-column:1/-1;">Phone<input type="text" name="phone" value="${escapeHtml(s.phone || '')}" /></label>
        </div>
        <div class="actions-row"><button class="primary-btn" type="submit">Save Settings</button></div>
      </form>
    </div>
  `;

  $('#settings-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const payload = Object.fromEntries(form);
    try {
      await api('/api/settings', { method: 'PUT', body: JSON.stringify(payload) });
      toast('Settings saved');
      await refresh();
    } catch (error) {
      toast(error.message);
    }
  });
}

function buildModal(id, title, fields, submitHandler) {
  const modal = document.createElement('div');
  modal.id = id;
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal">
      <button class="close-modal" type="button" data-close="${id}">×</button>
      <p class="eyebrow">ADD</p>
      <h2>${title}</h2>
      <form id="${id}-form">
        ${fields}
        <div class="actions-row">
          <button type="button" class="secondary-btn" data-close="${id}">Cancel</button>
          <button type="submit" class="primary-btn">Save</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('[data-close]').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.remove();
  });

  modal.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const payload = Object.fromEntries(form);
    try {
      await submitHandler(payload);
      modal.remove();
      toast('Saved!');
      await refresh();
    } catch (error) {
      toast(error.message);
    }
  });
}

function openDialog(type) {
  if (type === 'product') {
    buildModal('product-modal', 'Add Product', `
      <div class="form-grid">
        <label>Name<input name="name" required /></label>
        <label>Category<input name="category" value="Groceries" /></label>
        <label>Price<input type="number" name="price" value="0" required /></label>
        <label>Stock<input type="number" name="stock" value="0" required /></label>
        <label>Reorder<input type="number" name="reorder" value="0" required /></label>
      </div>
    `, (payload) => api('/api/products', { method: 'POST', body: JSON.stringify(payload) }));
    return;
  }

  if (type === 'sale') {
    const productOptions = state.products.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
    buildModal('sale-modal', 'Record Sale', `
      <div class="form-grid">
        <label>Product<select name="selectedProductId" required>${productOptions || '<option value="">No products</option>'}</select></label>
        <label>Quantity<input type="number" name="quantity" min="1" value="1" required /></label>
        <label>Payment<select name="payment"><option>Cash</option><option>Mobile Money</option><option>Card</option></select></label>
        <label>Customer<input name="customer" placeholder="Leave blank for walk-in" /></label>
      </div>
    `, (payload) => api('/api/sales', { method: 'POST', body: JSON.stringify(payload) }));
    return;
  }

  if (type === 'customer') {
    buildModal('customer-modal', 'Add Customer', `
      <div class="form-grid">
        <label>Name<input name="name" required /></label>
        <label>Phone<input name="phone" /></label>
        <label>Loyalty<select name="loyalty"><option>Bronze</option><option>Silver</option><option>Gold</option></select></label>
      </div>
    `, (payload) => api('/api/customers', { method: 'POST', body: JSON.stringify(payload) }));
    return;
  }

  if (type === 'supplier') {
    buildModal('supplier-modal', 'Add Supplier', `
      <div class="form-grid">
        <label>Name<input name="name" required /></label>
        <label>Phone<input name="phone" /></label>
        <label>Contact<input name="contact" /></label>
      </div>
    `, (payload) => api('/api/suppliers', { method: 'POST', body: JSON.stringify(payload) }));
    return;
  }

  if (type === 'purchase') {
    const supplierOptions = state.suppliers.map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
    buildModal('purchase-modal', 'New Purchase Order', `
      <div class="form-grid">
        <label>Supplier<select name="supplier_id" required>${supplierOptions || '<option value="">No suppliers</option>'}</select></label>
        <label>Notes<textarea name="notes" style="min-height:100px;" placeholder="Optional notes"></textarea></label>
      </div>
    `, async (payload) => {
      const items = [{ name: 'Supplier stock order', quantity: 1, price: 0 }];
      return api('/api/purchases', { method: 'POST', body: JSON.stringify({ ...payload, items }) });
    });
    return;
  }

  if (type === 'expense') {
    buildModal('expense-modal', 'Add Expense', `
      <div class="form-grid">
        <label>Label<input name="label" required /></label>
        <label>Category<input name="category" value="General" /></label>
        <label>Amount<input type="number" name="amount" value="0" required /></label>
        <label>Date<input type="date" name="date" value="${new Date().toISOString().slice(0, 10)}" /></label>
      </div>
    `, (payload) => api('/api/expenses', { method: 'POST', body: JSON.stringify(payload) }));
  }
}

function bindActions() {
  document.querySelectorAll('[data-view]').forEach((btn) => {
    btn.onclick = () => showView(btn.dataset.view);
  });

  document.querySelectorAll('[data-action="quick-sale"]').forEach((btn) => btn.addEventListener('click', () => openDialog('sale')));
  document.querySelectorAll('[data-action="quick-product"]').forEach((btn) => btn.addEventListener('click', () => openDialog('product')));
  document.querySelectorAll('[data-action="quick-purchase"]').forEach((btn) => btn.addEventListener('click', () => openDialog('purchase')));

  document.querySelectorAll('[data-action="add-product"]').forEach((btn) => btn.addEventListener('click', () => openDialog('product')));
  document.querySelectorAll('[data-action="add-sale"]').forEach((btn) => btn.addEventListener('click', () => openDialog('sale')));
  document.querySelectorAll('[data-action="add-customer"]').forEach((btn) => btn.addEventListener('click', () => openDialog('customer')));
  document.querySelectorAll('[data-action="add-supplier"]').forEach((btn) => btn.addEventListener('click', () => openDialog('supplier')));
  document.querySelectorAll('[data-action="add-purchase"]').forEach((btn) => btn.addEventListener('click', () => openDialog('purchase')));
  document.querySelectorAll('[data-action="add-expense"]').forEach((btn) => btn.addEventListener('click', () => openDialog('expense')));

  document.querySelectorAll('[data-action="print-receipt"]').forEach((btn) => {
    btn.addEventListener('click', () => window.open(`/api/receipt/${btn.dataset.id}`, '_blank'));
  });
}

async function refresh() {
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

    $('#store-name').textContent = settings.storeName || 'Petit Marché';
    $('#store-city').textContent = `${settings.city || 'Douala'}, Cameroon`;
    $('#product-count').textContent = String(products.length);

    renderCurrent();
  } catch (error) {
    console.error(error);
    toast(error.message);
  }
}

async function login(email, password) {
  try {
    const result = await api('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    state.user = result.user;
    $('#login-shell').classList.add('hidden');
    $('#app-shell').classList.remove('hidden');
    await refresh();
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

function init() {
  $('#today-date').textContent = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  $('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const payload = Object.fromEntries(data);
    await login(payload.email, payload.password);
  });

  $('#logout-btn').addEventListener('click', logout);
  $('#mobile-menu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));

  document.querySelectorAll('[data-view]').forEach((el) => {
    el.addEventListener('click', () => showView(el.dataset.view));
  });

  renderDashboard();
}

init();
