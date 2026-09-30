const state = {
  dashboard: null,
  products: [],
  sales: [],
  customers: [],
  suppliers: [],
  reports: null,
  settings: null,
  activeView: 'dashboard'
};

const $$ = (selector) => document.querySelector(selector);
const money = (value) => `${new Intl.NumberFormat('en-US').format(value)} FCFA`;
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.firstChild.textContent = `${message} `;
  toast.classList.add('show');
  clearTimeout(showToast.tid);
  showToast.tid = setTimeout(() => toast.classList.remove('show'), 2200);
}

function setPageTitle(name) {
  document.getElementById('page-title').textContent = name;
}

function updateHeader(meta) {
  document.getElementById('store-name').textContent = meta.storeName || 'Petit Marché';
  document.getElementById('store-city').textContent = `${meta.city || 'Douala'}, Cameroon`;
  document.getElementById('owner-name').textContent = 'Amélie N.';
  document.getElementById('owner-role').textContent = 'Owner';
  document.getElementById('profile-avatar').textContent = 'AN';
  const storeCode = (meta.storeName || 'Petit Marché').split(' ').map(x => x[0]).join('').slice(0,2).toUpperCase();
  document.getElementById('store-avatar').textContent = storeCode || 'PM';
}

function renderDashboard() {
  const container = document.getElementById('dashboard-view');
  if (!state.dashboard) return;
  const { totalSales, totalExpenses, netRevenue, lowStockCount, productsCount, customersCount, store, lowStock } = state.dashboard;
  container.innerHTML = `
    <div class="page-heading">
      <div>
        <p class="eyebrow">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <h1>Good morning, Amélie <span>✦</span></h1>
        <p class="subtitle">Here is your business snapshot for ${store.city || 'Douala'}.</p>
      </div>
      <button class="primary-btn" id="new-sale-btn">＋ Record sale</button>
    </div>

    <div class="stats-grid">
      <article class="stat-card">
        <div class="stat-top"><span>Total sales</span><span class="stat-icon green">↗</span></div>
        <strong>${money(totalSales)}</strong>
        <p class="positive">Monthly performance</p>
      </article>
      <article class="stat-card">
        <div class="stat-top"><span>Net revenue</span><span class="stat-icon purple">▣</span></div>
        <strong>${money(netRevenue)}</strong>
        <p class="positive">After expenses</p>
      </article>
      <article class="stat-card">
        <div class="stat-top"><span>Products</span><span class="stat-icon orange">♙</span></div>
        <strong>${productsCount}</strong>
        <p class="positive">Active items</p>
      </article>
      <article class="stat-card">
        <div class="stat-top"><span>Low stock</span><span class="stat-icon red">!</span></div>
        <strong>${lowStockCount}</strong>
        <p class="warning">Needs attention</p>
      </article>
    </div>

    <div class="dashboard-grid">
      <article class="panel">
        <div class="panel-heading">
          <div>
            <h2>Sales overview</h2>
            <p>Revenue in FCFA this month</p>
          </div>
          <button class="secondary-btn">Last 30 days</button>
        </div>
        <div class="chart-wrap">
          <div class="y-labels"><span>300k</span><span>200k</span><span>100k</span><span>0</span></div>
          <div class="chart">
            <div class="grid-lines"><i></i><i></i><i></i><i></i></div>
            <svg viewBox="0 0 700 220" preserveAspectRatio="none">
              <path d="M0,170 C80,150 130,125 185,135 S260,85 315,110 S405,80 470,95 S560,40 700,60 L700,220 L0,220 Z" fill="#dff5ef"/>
              <path d="M0,170 C80,150 130,125 185,135 S260,85 315,110 S405,80 470,95 S560,40 700,60" fill="none" stroke="#22a887" stroke-width="3"/>
            </svg>
            <div class="x-labels"><span>W1</span><span>W2</span><span>W3</span><span>W4</span></div>
          </div>
        </div>
        <div class="chart-legend"><span><i class="legend-dot"></i> Revenue</span><b>${money(totalSales)}</b></div>
      </article>

      <article class="panel">
        <div class="panel-heading">
          <div>
            <h2>Quick actions</h2>
            <p>Daily tasks</p>
          </div>
        </div>
        <div class="quick-actions">
          <button data-open="product">
            <span class="action-icon teal">＋</span>
            <span><b>Add product</b><small>Update catalog</small></span>
            <strong>→</strong>
          </button>
          <button data-open="sale">
            <span class="action-icon blue">↗</span>
            <span><b>Record sale</b><small>Log payment</small></span>
            <strong>→</strong>
          </button>
          <button data-open="customer">
            <span class="action-icon yellow">♙</span>
            <span><b>Add customer</b><small>Keep records</small></span>
            <strong>→</strong>
          </button>
        </div>
      </article>
    </div>

    <div class="bottom-grid">
      <article class="panel">
        <div class="panel-heading">
          <div><h2>Inventory alerts</h2><p>Products close to reorder point</p></div>
          <button class="secondary-btn" data-view="products">View all</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Product</th><th>Stock</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${lowStock.map(prod => `
                <tr>
                  <td>${prod.name}</td>
                  <td><span class="stock-bar"><i style="width:${Math.min(100, (prod.stock / Math.max(prod.reorder * 2, 20)) * 100)}%"></i></span>${prod.stock}</td>
                  <td><span class="status low">Low</span></td>
                </tr>
              `).join('') || '<tr><td colspan="3">No urgent inventory issues</td></tr>'}
            </tbody>
          </table>
        </div>
      </article>

      <article class="panel">
        <div class="panel-heading">
          <div><h2>Business snapshot</h2><p>Quick summary</p></div>
        </div>
        <div class="table-wrap">
          <table>
            <tbody>
              <tr><td>Customers</td><td>${customersCount}</td></tr>
              <tr><td>Expenses</td><td>${money(totalExpenses)}</td></tr>
              <tr><td>Store</td><td>${store.storeName || 'Petit Marché'}</td></tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  `;

  document.getElementById('new-sale-btn').addEventListener('click', () => openSaleDialog());
  document.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-open');
    if (target === 'product') openProductDialog();
    if (target === 'sale') openSaleDialog();
    if (target === 'customer') openCustomerDialog();
  }));
  document.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => switchView(btn.getAttribute('data-view'))));
}

function renderProducts() {
  const container = document.getElementById('products-view');
  container.innerHTML = `
    <div class="page-heading">
      <div>
        <p class="eyebrow">Catalog</p>
        <h1>Products</h1>
        <p class="subtitle">Track stock levels and pricing in one place.</p>
      </div>
      <button class="primary-btn" id="new-product">＋ Add product</button>
    </div>

    <div class="panel book-panel">
      <div class="toolbar">
        <label class="search"><span>⌕</span><input id="product-search" placeholder="Search products..." /></label>
        <select id="category-filter">
          <option value="all">All categories</option>
          ${[...new Set(state.products.map(p => p.category))].map(cat => `<option value="${cat}">${cat}</option>`).join('')}
        </select>
      </div>

      <div class="table-wrap">
        <table>
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>In stock</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            ${state.products.map(product => {
              const isLow = product.stock <= product.reorder;
              return `<tr>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${money(product.price)}</td>
                <td>${product.stock}</td>
                <td><span class="status ${isLow ? 'low' : 'good'}">${isLow ? 'Low stock' : 'In stock'}</span></td>
                <td><button class="secondary-btn delete-product" data-id="${product.id}">Delete</button></td>
              </tr>`;
            }).join('') || '<tr><td colspan="6">No products yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('new-product').addEventListener('click', openProductDialog);
  document.getElementById('product-search').addEventListener('input', filterProducts);
  document.getElementById('category-filter').addEventListener('change', filterProducts);
  document.querySelectorAll('.delete-product').forEach(btn => btn.addEventListener('click', handleDeleteProduct));
}

function filterProducts() {
  const text = document.getElementById('product-search').value.trim().toLowerCase();
  const category = document.getElementById('category-filter').value;
  const filtered = state.products.filter(product => {
    const matchesText = product.name.toLowerCase().includes(text);
    const matchesCategory = category === 'all' || product.category === category;
    return matchesText && matchesCategory;
  });
  const tbody = document.querySelector('#products-view tbody');
  if (!tbody) return;
  tbody.innerHTML = filtered.map(product => {
    const isLow = product.stock <= product.reorder;
    return `<tr>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${money(product.price)}</td>
      <td>${product.stock}</td>
      <td><span class="status ${isLow ? 'low' : 'good'}">${isLow ? 'Low stock' : 'In stock'}</span></td>
      <td><button class="secondary-btn delete-product" data-id="${product.id}">Delete</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="6">No products found.</td></tr>';
  document.querySelectorAll('.delete-product').forEach(btn => btn.addEventListener('click', handleDeleteProduct));
}

function renderSales() {
  const container = document.getElementById('sales-view');
  container.innerHTML = `
    <div class="page-heading">
      <div>
        <p class="eyebrow">Transactions</p>
        <h1>Sales</h1>
        <p class="subtitle">Track every payment by cash, Mobile Money, and other methods.</p>
      </div>
      <button class="primary-btn" id="new-sale">＋ Record sale</button>
    </div>

    <div class="stats-grid">
      <article class="stat-card">
        <div class="stat-top"><span>Today</span><span class="stat-icon green">↗</span></div>
        <strong>${money(state.sales.filter(s => s.date === new Date().toISOString().slice(0,10)).reduce((sum, s) => sum + s.total, 0))}</strong>
        <p class="positive">Sales today</p>
      </article>
      <article class="stat-card">
        <div class="stat-top"><span>Total sales</span><span class="stat-icon purple">▣</span></div>
        <strong>${money(state.sales.reduce((sum, s) => sum + s.total, 0))}</strong>
        <p class="positive">All transactions</p>
      </article>
      <article class="stat-card">
        <div class="stat-top"><span>Transactions</span><span class="stat-icon orange">♙</span></div>
        <strong>${state.sales.length}</strong>
        <p class="positive">Recorded</p>
      </article>
      <article class="stat-card">
        <div class="stat-top"><span>Mobile Money</span><span class="stat-icon red">!</span></div>
        <strong>${state.sales.filter(s => s.payment === 'Mobile Money').length}</strong>
        <p class="warning">Payments</p>
      </article>
    </div>

    <div class="panel">
      <div class="panel-heading">
        <div><h2>Recent sales</h2><p>Latest payment records</p></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Reference</th><th>Customer</th><th>Items</th><th>Payment</th><th>Total</th><th>Date</th></tr></thead>
          <tbody>
            ${state.sales.map(sale => `
              <tr>
                <td>${sale.reference}</td>
                <td>${sale.customer}</td>
                <td>${sale.items.map(item => `${item.quantity}× ${item.name}`).join(', ')}</td>
                <td>${sale.payment}</td>
                <td>${money(sale.total)}</td>
                <td>${formatDate(sale.date)}</td>
              </tr>
            `).join('') || '<tr><td colspan="6">No sales recorded yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
  document.getElementById('new-sale').addEventListener('click', openSaleDialog);
}

function renderCustomers() {
  const container = document.getElementById('customers-view');
  container.innerHTML = `
    <div class="page-heading">
      <div>
        <p class="eyebrow">CRM</p>
        <h1>Customers</h1>
        <p class="subtitle">Keep customer information and loyalty tiers organized.</p>
      </div>
      <button class="primary-btn" id="new-customer">＋ Add customer</button>
    </div>

    <div class="panel">
      <div class="panel-heading">
        <div><h2>Customer directory</h2><p>All saved customers</p></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Phone</th><th>Loyalty</th></tr></thead>
          <tbody>
            ${state.customers.map(customer => `
              <tr><td>${customer.name}</td><td>${customer.phone}</td><td>${customer.loyalty}</td></tr>
            `).join('') || '<tr><td colspan="3">No customers saved yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
  document.getElementById('new-customer').addEventListener('click', openCustomerDialog);
}

function renderSuppliers() {
  const container = document.getElementById('suppliers-view');
  container.innerHTML = `
    <div class="page-heading">
      <div>
        <p class="eyebrow">Inventory</p>
        <h1>Suppliers</h1>
        <p class="subtitle">Track business partners and purchase contacts.</p>
      </div>
      <button class="primary-btn" id="new-supplier">＋ Add supplier</button>
    </div>

    <div class="panel">
      <div class="panel-heading">
        <div><h2>Supplier list</h2><p>Purchase partners</p></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Phone</th><th>Contact</th></tr></thead>
          <tbody>
            ${state.suppliers.map(supplier => `
              <tr><td>${supplier.name}</td><td>${supplier.phone}</td><td>${supplier.contact}</td></tr>
            `).join('') || '<tr><td colspan="3">No suppliers saved yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
  document.getElementById('new-supplier').addEventListener('click', openSupplierDialog);
}

function renderReports() {
  const container = document.getElementById('reports-view');
  container.innerHTML = `
    <div class="page-heading">
      <div>
        <p class="eyebrow">Analytics</p>
        <h1>Reports</h1>
        <p class="subtitle">Simple business intelligence for daily decisions.</p>
      </div>
    </div>
    <div class="stats-grid">
      <article class="stat-card"><div class="stat-top"><span>Sales total</span><span class="stat-icon green">↗</span></div><strong>${money(state.reports ? state.reports.salesTotal : 0)}</strong><p class="positive">Gross revenue</p></article>
      <article class="stat-card"><div class="stat-top"><span>Expenses</span><span class="stat-icon purple">▣</span></div><strong>${money(state.reports ? state.reports.expenseTotal : 0)}</strong><p class="positive">Operational spend</p></article>
      <article class="stat-card"><div class="stat-top"><span>Net</span><span class="stat-icon orange">♙</span></div><strong>${money(state.reports ? state.reports.net : 0)}</strong><p class="positive">Profit</p></article>
      <article class="stat-card"><div class="stat-top"><span>Top seller</span><span class="stat-icon red">!</span></div><strong>${state.reports && state.reports.bestSeller ? state.reports.bestSeller.name : 'N/A'}</strong><p class="warning">${state.reports && state.reports.bestSeller ? `${state.reports.bestSeller.qty} sold` : 'No sales yet'}</p></article>
    </div>
  `;
}

function renderSettings() {
  const container = document.getElementById('settings-view');
  container.innerHTML = `
    <div class="page-heading">
      <div>
        <p class="eyebrow">Preferences</p>
        <h1>Settings</h1>
        <p class="subtitle">Configure your store details and business preferences.</p>
      </div>
    </div>
    <div class="panel form-panel">
      <form id="settings-form" class="form-grid">
        <label>Store name<input name="storeName" value="${state.settings?.storeName || ''}" /></label>
        <label>City<input name="city" value="${state.settings?.city || ''}" /></label>
        <label>Currency<select name="currency"><option ${state.settings?.currency === 'FCFA' ? 'selected' : ''}>FCFA</option><option ${state.settings?.currency === 'USD' ? 'selected' : ''}>USD</option></select></label>
        <label>Language<select name="language"><option ${state.settings?.language === 'English' ? 'selected' : ''}>English</option><option ${state.settings?.language === 'French' ? 'selected' : ''}>French</option></select></label>
        <label>Phone<input name="phone" value="${state.settings?.phone || ''}" /></label>
        <div></div>
        <div class="actions-row" style="grid-column: 1 / -1;"><button type="submit" class="primary-btn">Save settings</button></div>
      </form>
    </div>
  `;
  document.getElementById('settings-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.target).entries());
    const data = await api('/api/settings', { method: 'PUT', body: JSON.stringify(body) });
    state.settings = data;
    updateHeader(data);
    showToast('Settings saved');
  });
}

function switchView(view) {
  state.activeView = view;
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === view));
  document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === `${view}-view`));
  setPageTitle(view.charAt(0).toUpperCase() + view.slice(1));
  if (view === 'dashboard') renderDashboard();
  if (view === 'products') renderProducts();
  if (view === 'sales') renderSales();
  if (view === 'customers') renderCustomers();
  if (view === 'suppliers') renderSuppliers();
  if (view === 'reports') renderReports();
  if (view === 'settings') renderSettings();
}

function openProductDialog() {
  const form = `
    <div class="modal-backdrop open" id="product-modal">
      <div class="modal">
        <button class="close-modal" data-close="product-modal">×</button>
        <p class="eyebrow">Inventory</p>
        <h2>Add product</h2>
        <form id="product-form" class="form-grid" style="margin-top:18px;">
          <label>Product name<input name="name" required /></label>
          <label>Category<select name="category"><option>Groceries</option><option>Beverages</option><option>Household</option><option>Personal care</option></select></label>
          <label>Price (FCFA)<input name="price" type="number" min="0" required /></label>
          <label>Stock quantity<input name="stock" type="number" min="0" required /></label>
          <label>Reorder level<input name="reorder" type="number" min="0" value="5" required /></label>
          <div></div>
          <div class="actions-row" style="grid-column:1 / -1; justify-content:flex-start;">
            <button type="submit" class="primary-btn">Save product</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', form);
  document.querySelector('[data-close="product-modal"]').addEventListener('click', () => document.getElementById('product-modal').remove());
  document.getElementById('product-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.target).entries());
    const product = await api('/api/products', { method: 'POST', body: JSON.stringify(body) });
    state.products.unshift(product);
    document.getElementById('product-modal').remove();
    renderProducts();
    showToast('Product added');
    refreshDashboard();
  });
}

function openSaleDialog() {
  const options = state.products.map(product => `<option value="${product.id}">${product.name} (${product.stock} in stock)</option>`).join('');
  const form = `
    <div class="modal-backdrop open" id="sale-modal">
      <div class="modal">
        <button class="close-modal" data-close="sale-modal">×</button>
        <p class="eyebrow">Point of sale</p>
        <h2>Record sale</h2>
        <form id="sale-form" class="form-grid" style="margin-top:18px;">
          <label>Product<select name="selectedProductId">${options}</select></label>
          <label>Quantity<input name="quantity" type="number" min="1" value="1" required /></label>
          <label>Payment<select name="payment"><option>Cash</option><option>Mobile Money</option><option>Orange Money</option></select></label>
          <label>Customer<input name="customer" placeholder="Name or walk-in" /></label>
          <div class="actions-row" style="grid-column:1 / -1; justify-content:flex-start;">
            <button type="submit" class="primary-btn">Save sale</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', form);
  document.querySelector('[data-close="sale-modal"]').addEventListener('click', () => document.getElementById('sale-modal').remove());
  document.getElementById('sale-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.target).entries());
    try {
      const sale = await api('/api/sales', { method: 'POST', body: JSON.stringify({ ...body, quantity: Number(body.quantity) }) });
      state.sales.unshift(sale);
      document.getElementById('sale-modal').remove();
      renderSales();
      refreshDashboard();
      showToast('Sale recorded');
    } catch (error) {
      showToast(error.message);
    }
  });
}

function openCustomerDialog() {
  const form = `
    <div class="modal-backdrop open" id="customer-modal">
      <div class="modal">
        <button class="close-modal" data-close="customer-modal">×</button>
        <p class="eyebrow">Customers</p>
        <h2>Add customer</h2>
        <form id="customer-form" class="form-grid" style="margin-top:18px;">
          <label>Name<input name="name" required /></label>
          <label>Loyalty<select name="loyalty"><option>Silver</option><option>Gold</option><option>Platinum</option></select></label>
          <label style="grid-column:1 / -1;">Phone<input name="phone" required /></label>
          <div class="actions-row" style="grid-column:1 / -1; justify-content:flex-start;">
            <button type="submit" class="primary-btn">Save customer</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', form);
  document.querySelector('[data-close="customer-modal"]').addEventListener('click', () => document.getElementById('customer-modal').remove());
  document.getElementById('customer-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.target).entries());
    const customer = await api('/api/customers', { method: 'POST', body: JSON.stringify(body) });
    state.customers.unshift(customer);
    document.getElementById('customer-modal').remove();
    renderCustomers();
    refreshDashboard();
    showToast('Customer saved');
  });
}

function openSupplierDialog() {
  const form = `
    <div class="modal-backdrop open" id="supplier-modal">
      <div class="modal">
        <button class="close-modal" data-close="supplier-modal">×</button>
        <p class="eyebrow">Suppliers</p>
        <h2>Add supplier</h2>
        <form id="supplier-form" class="form-grid" style="margin-top:18px;">
          <label>Name<input name="name" required /></label>
          <label>Phone<input name="phone" required /></label>
          <label style="grid-column:1 / -1;">Contact<input name="contact" required /></label>
          <div class="actions-row" style="grid-column:1 / -1; justify-content:flex-start;">
            <button type="submit" class="primary-btn">Save supplier</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', form);
  document.querySelector('[data-close="supplier-modal"]').addEventListener('click', () => document.getElementById('supplier-modal').remove());
  document.getElementById('supplier-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.target).entries());
    const supplier = await api('/api/suppliers', { method: 'POST', body: JSON.stringify(body) });
    state.suppliers.unshift(supplier);
    document.getElementById('supplier-modal').remove();
    renderSuppliers();
    showToast('Supplier saved');
  });
}

async function handleDeleteProduct(event) {
  const id = event.currentTarget.dataset.id;
  await api(`/api/products/${id}`, { method: 'DELETE' });
  state.products = state.products.filter(product => product.id !== id);
  renderProducts();
  refreshDashboard();
  showToast('Product removed');
}

async function refreshDashboard() {
  const [dashboard, products, sales, customers, suppliers, reports, settings] = await Promise.all([
    api('/api/dashboard'),
    api('/api/products'),
    api('/api/sales'),
    api('/api/customers'),
    api('/api/suppliers'),
    api('/api/reports'),
    api('/api/settings')
  ]);
  state.dashboard = dashboard;
  state.products = products;
  state.sales = sales;
  state.customers = customers;
  state.suppliers = suppliers;
  state.reports = reports;
  state.settings = settings;
  updateHeader(settings);
  switchView(state.activeView);
}

async function init() {
  document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  try {
    await refreshDashboard();
  } catch (error) {
    console.error(error);
    showToast('API unavailable');
  }

  document.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', () => switchView(item.dataset.view)));
  document.getElementById('mobile-menu').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
}

init();
