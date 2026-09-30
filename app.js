const initialProducts = [
  { name: 'Rice 25kg', category: 'Groceries', price: 18500, stock: 3, reorder: 10 },
  { name: 'Vegetable Oil 5L', category: 'Groceries', price: 7200, stock: 6, reorder: 8 },
  { name: 'Beaufort Lager', category: 'Beverages', price: 750, stock: 24, reorder: 12 },
  { name: 'Mocaf Bread', category: 'Groceries', price: 500, stock: 4, reorder: 10 },
  { name: 'Laundry Soap', category: 'Household', price: 900, stock: 18, reorder: 8 },
  { name: 'Onions 1kg', category: 'Groceries', price: 1000, stock: 7, reorder: 10 },
  { name: 'Water 1.5L', category: 'Beverages', price: 400, stock: 36, reorder: 12 },
  { name: 'Toothpaste', category: 'Personal care', price: 1800, stock: 2, reorder: 6 }
];
let products = JSON.parse(localStorage.getItem('mboastock-products')) || initialProducts;
let sales = JSON.parse(localStorage.getItem('mboastock-sales')) || [];
const money = value => new Intl.NumberFormat('en-US').format(value) + ' FCFA';
const $ = selector => document.querySelector(selector);
function statusFor(product) { return product.stock <= product.reorder ? 'Low stock' : 'In stock'; }
function productRow(product, inventoryOnly = false) {
  const percent = Math.min(100, Math.max(8, (product.stock / Math.max(product.reorder * 2, 20)) * 100));
  const status = statusFor(product);
  if (inventoryOnly && status !== 'Low stock') return '';
  return `<tr><td>${product.name}</td>${inventoryOnly ? `<td class="stock-cell"><span class="stock-bar"><i style="width:${percent}%"></i></span>${product.stock} left</td><td><span class="status low">${status}</span></td><td>•••</td>` : `<td>${product.category}</td><td>${money(product.price)}</td><td>${product.stock}</td><td><span class="status ${status === 'Low stock' ? 'low' : 'good'}">${status}</span></td><td>•••</td>`}</tr>`;
}
function renderProducts(filter = '') {
  const filtered = products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
  $('#products-table').innerHTML = filtered.map(p => productRow(p)).join('') || '<tr><td colspan="6">No products found.</td></tr>';
  const low = products.filter(p => statusFor(p) === 'Low stock');
  $('#inventory-table').innerHTML = low.map(p => productRow(p, true)).join('') || '<tr><td colspan="4">All products are well stocked 🎉</td></tr>';
  $('#product-count').textContent = products.length; $('#low-stock-total').textContent = low.length;
}
function showView(view) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  $(`#${view}-view`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.view === view));
  $('#page-title').textContent = view[0].toUpperCase() + view.slice(1); $('#sidebar').classList.remove('open');
  if (view === 'sales') renderSales();
}
function openModal() { $('#modal').classList.add('open'); $('#modal input')?.focus(); }
function closeModal() { $('#modal').classList.remove('open'); }
function toast(message) { $('#toast').firstChild.textContent = message + ' '; $('#toast').classList.add('show'); setTimeout(() => $('#toast').classList.remove('show'), 2800); }
function persist() { localStorage.setItem('mboastock-products', JSON.stringify(products)); localStorage.setItem('mboastock-sales', JSON.stringify(sales)); }
function renderSales() {
  const view = $('#sales-view');
  view.innerHTML = `<div class="page-heading"><div><p class="eyebrow">TRANSACTIONS</p><h1>Sales</h1><p class="subtitle">Record payments and keep your daily sales organized.</p></div><button class="primary-btn" id="new-sale">＋ Record sale</button></div><div class="sales-summary"><div class="stat-card"><span>Today</span><strong>${money(sales.filter(s => s.date === new Date().toISOString().slice(0,10)).reduce((a,s) => a+s.total,0))}</strong></div><div class="stat-card"><span>Transactions</span><strong>${sales.length}</strong></div><div class="stat-card"><span>Payment mix</span><strong>${sales.filter(s => s.payment === 'Mobile Money').length} Mobile Money</strong></div></div><div class="panel"><div class="panel-heading"><div><h2>Recent transactions</h2><p>Every sale recorded from this device</p></div></div><div class="table-scroll"><table><thead><tr><th>REFERENCE</th><th>ITEMS</th><th>PAYMENT</th><th>TOTAL</th><th>DATE</th></tr></thead><tbody>${sales.slice().reverse().map(s => `<tr><td>${s.reference}</td><td>${s.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}</td><td>${s.payment}</td><td><b>${money(s.total)}</b></td><td>${s.date}</td></tr>`).join('') || '<tr><td colspan="5">No sales recorded yet.</td></tr>'}</tbody></table></div></div>`;
  $('#new-sale').addEventListener('click', openSaleModal);
}
function openSaleModal() {
  const modal = document.createElement('div'); modal.className = 'modal-backdrop open'; modal.id = 'sale-modal';
  modal.innerHTML = `<div class="modal"><button class="close-modal" id="close-sale">×</button><p class="eyebrow">POINT OF SALE</p><h2>Record a sale</h2><p class="modal-subtitle">Stock will be updated automatically.</p><form id="sale-form"><label>Product<select name="product">${products.map((p,i) => `<option value="${i}">${p.name} — ${money(p.price)} (${p.stock} available)</option>`).join('')}</select></label><div class="form-row"><label>Quantity<input name="quantity" type="number" min="1" value="1" required /></label><label>Payment<select name="payment"><option>Cash</option><option>Mobile Money</option><option>Orange Money</option></select></label></div><label>Customer name (optional)<input name="customer" placeholder="e.g. Jean-Pierre Mbarga" /></label><button class="primary-btn full" type="submit">Save sale</button></form></div>`;
  document.body.appendChild(modal); $('#close-sale').onclick = () => modal.remove();
  $('#sale-form').onsubmit = e => { e.preventDefault(); const data = new FormData(e.target), product = products[Number(data.get('product'))], quantity = Number(data.get('quantity')); if (quantity > product.stock) return toast('Not enough stock available'); product.stock -= quantity; sales.push({ reference: `SALE-${String(Date.now()).slice(-6)}`, items: [{name:product.name, quantity}], total: product.price * quantity, payment:data.get('payment'), customer:data.get('customer'), date:new Date().toISOString().slice(0,10) }); persist(); modal.remove(); renderProducts(); renderSales(); toast('Sale recorded successfully'); };
}
const extraStyle = document.createElement('style'); extraStyle.textContent = '.sales-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px}.sales-summary .stat-card{display:flex;flex-direction:column;gap:10px}.sales-summary .stat-card span{color:var(--muted);font-size:12px}.sales-summary .stat-card strong{font:700 19px Space Grotesk}@media(max-width:560px){.sales-summary{grid-template-columns:1fr}}'; document.head.appendChild(extraStyle);
document.querySelectorAll('.nav-item,.text-btn[data-view]').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
$('#add-product').addEventListener('click', openModal); $('#add-product-action').addEventListener('click', openModal); $('#close-modal').addEventListener('click', closeModal); $('#modal').addEventListener('click', e => { if (e.target === $('#modal')) closeModal(); });
$('#product-search').addEventListener('input', e => renderProducts(e.target.value)); $('#mobile-menu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#quick-sale').addEventListener('click', () => showView('sales')); $('#record-sale-action').addEventListener('click', () => showView('sales')); $('#sales-empty').addEventListener('click', openSaleModal);
$('#product-form').addEventListener('submit', e => { e.preventDefault(); const data = new FormData(e.target); products.unshift({name:data.get('name'),category:data.get('category'),price:Number(data.get('price')),stock:Number(data.get('stock')),reorder:Number(data.get('reorder'))}); persist(); renderProducts(); e.target.reset(); closeModal(); toast('Product added successfully'); });
renderProducts();
