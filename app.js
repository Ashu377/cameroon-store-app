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
  $('#product-count').textContent = products.length;
  $('#low-stock-total').textContent = low.length;
}
function showView(view) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  $(`#${view}-view`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.view === view));
  $('#page-title').textContent = view[0].toUpperCase() + view.slice(1);
  $('#sidebar').classList.remove('open');
}
function openModal() { $('#modal').classList.add('open'); $('#modal input')?.focus(); }
function closeModal() { $('#modal').classList.remove('open'); }
function toast(message) { $('#toast').firstChild.textContent = message + ' '; $('#toast').classList.add('show'); setTimeout(() => $('#toast').classList.remove('show'), 2800); }

document.querySelectorAll('.nav-item,.text-btn[data-view]').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
$('#add-product').addEventListener('click', openModal); $('#add-product-action').addEventListener('click', openModal); $('#close-modal').addEventListener('click', closeModal); $('#modal').addEventListener('click', e => { if (e.target === $('#modal')) closeModal(); });
$('#product-search').addEventListener('input', e => renderProducts(e.target.value));
$('#mobile-menu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#quick-sale').addEventListener('click', () => { showView('sales'); toast('Sales workspace ready'); }); $('#record-sale-action').addEventListener('click', () => { showView('sales'); toast('Sales workspace ready'); }); $('#sales-empty').addEventListener('click', () => toast('Sale form coming soon'));
$('#product-form').addEventListener('submit', e => { e.preventDefault(); const data = new FormData(e.target); products.unshift({ name:data.get('name'), category:data.get('category'), price:Number(data.get('price')), stock:Number(data.get('stock')), reorder:Number(data.get('reorder')) }); localStorage.setItem('mboastock-products', JSON.stringify(products)); renderProducts(); e.target.reset(); closeModal(); toast('Product added successfully'); });
renderProducts();
