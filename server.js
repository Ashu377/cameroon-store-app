const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'store.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const defaults = {
  user: { name: 'Amélie N.', role: 'Owner', email: 'admin@mboastock.cm' },
  settings: { storeName: 'Petit Marché', city: 'Douala', currency: 'FCFA', language: 'English', phone: '+237 6XX XXX XXX' },
  products: [
    { id: 'p1', name: 'Rice 25kg', category: 'Groceries', price: 18500, stock: 3, reorder: 10 },
    { id: 'p2', name: 'Vegetable Oil 5L', category: 'Groceries', price: 7200, stock: 6, reorder: 8 },
    { id: 'p3', name: 'Beaufort Lager', category: 'Beverages', price: 750, stock: 24, reorder: 12 },
    { id: 'p4', name: 'Mocaf Bread', category: 'Groceries', price: 500, stock: 4, reorder: 10 },
    { id: 'p5', name: 'Laundry Soap', category: 'Household', price: 900, stock: 18, reorder: 8 },
    { id: 'p6', name: 'Onions 1kg', category: 'Groceries', price: 1000, stock: 7, reorder: 10 },
    { id: 'p7', name: 'Water 1.5L', category: 'Beverages', price: 400, stock: 36, reorder: 12 },
    { id: 'p8', name: 'Toothpaste', category: 'Personal care', price: 1800, stock: 2, reorder: 6 }
  ],
  customers: [
    { id: 'c1', name: 'Jean-Pierre Mbarga', phone: '+237 656 123 456', loyalty: 'Gold' },
    { id: 'c2', name: 'Amina Tchoua', phone: '+237 677 987 654', loyalty: 'Silver' }
  ],
  suppliers: [
    { id: 's1', name: 'Bafoussam Food Hub', phone: '+237 699 555 111', contact: 'Nadine' },
    { id: 's2', name: 'Douala Household Supply', phone: '+237 690 222 333', contact: 'Martin' }
  ],
  sales: [],
  expenses: []
};

function readData() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify(defaults, null, 2));
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}
function writeData(data) { fs.writeFileSync(dataFile, JSON.stringify(data, null, 2)); }
function id(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

app.get('/api/health', (req, res) => res.json({ ok: true, message: 'MboaStock API is running' }));
app.get('/api/dashboard', (req, res) => {
  const data = readData();
  const totalSales = data.sales.reduce((sum, sale) => sum + Number(sale.total), 0);
  const totalExpenses = data.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const lowStock = data.products.filter(product => Number(product.stock) <= Number(product.reorder));
  res.json({ totalSales, totalExpenses, netRevenue: totalSales - totalExpenses, lowStockCount: lowStock.length, productsCount: data.products.length, customersCount: data.customers.length, store: data.settings, lowStock });
});

app.get('/api/products', (req, res) => res.json(readData().products));
app.post('/api/products', (req, res) => {
  const data = readData();
  const body = req.body || {};
  const product = { id: id('p'), name: String(body.name || '').trim(), category: body.category || 'Other', price: Number(body.price) || 0, stock: Number(body.stock) || 0, reorder: Number(body.reorder) || 0 };
  if (!product.name) return res.status(400).json({ message: 'Product name is required' });
  data.products.unshift(product); writeData(data); res.status(201).json(product);
});
app.delete('/api/products/:id', (req, res) => { const data = readData(); data.products = data.products.filter(item => item.id !== req.params.id); writeData(data); res.json({ ok: true }); });

app.get('/api/sales', (req, res) => res.json(readData().sales));
app.post('/api/sales', (req, res) => {
  const data = readData();
  const { selectedProductId, payment = 'Cash', customer = '', quantity } = req.body || {};
  const product = data.products.find(item => item.id === selectedProductId);
  const amount = Number(quantity);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (!Number.isInteger(amount) || amount < 1) return res.status(400).json({ message: 'Quantity must be a positive whole number' });
  if (amount > Number(product.stock)) return res.status(400).json({ message: 'Not enough stock available' });
  product.stock -= amount;
  const sale = { id: id('sale'), reference: `SALE-${String(Date.now()).slice(-6)}`, date: new Date().toISOString().slice(0, 10), payment, customer: customer || 'Walk-in customer', total: product.price * amount, items: [{ name: product.name, quantity: amount }] };
  data.sales.unshift(sale); writeData(data); res.status(201).json(sale);
});

app.get('/api/customers', (req, res) => res.json(readData().customers));
app.post('/api/customers', (req, res) => { const data = readData(); const customer = { id: id('c'), ...req.body }; data.customers.unshift(customer); writeData(data); res.status(201).json(customer); });
app.get('/api/suppliers', (req, res) => res.json(readData().suppliers));
app.post('/api/suppliers', (req, res) => { const data = readData(); const supplier = { id: id('s'), ...req.body }; data.suppliers.unshift(supplier); writeData(data); res.status(201).json(supplier); });
app.get('/api/reports', (req, res) => { const data = readData(); const salesTotal = data.sales.reduce((sum, sale) => sum + Number(sale.total), 0); const expenseTotal = data.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0); res.json({ salesTotal, expenseTotal, net: salesTotal - expenseTotal }); });
app.get('/api/settings', (req, res) => res.json(readData().settings));
app.put('/api/settings', (req, res) => { const data = readData(); data.settings = { ...data.settings, ...(req.body || {}) }; writeData(data); res.json(data.settings); });
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`MboaStock running on http://localhost:${PORT}`));
