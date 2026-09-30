const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'mboastock.db');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('DB connection error:', err.message);
  else console.log('SQLite connected');
});

const DEFAULT_LOGIN = { email: 'admin@mboastock.cm', password: 'admin123' };

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

async function initDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      role TEXT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      storeName TEXT,
      city TEXT,
      currency TEXT,
      language TEXT,
      phone TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT,
      category TEXT,
      price REAL,
      stock INTEGER,
      reorder INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      reference TEXT,
      date TEXT,
      payment TEXT,
      customer TEXT,
      total REAL,
      items TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT,
      phone TEXT,
      loyalty TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT,
      phone TEXT,
      contact TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      supplier_id TEXT,
      reference TEXT,
      date TEXT,
      status TEXT,
      total REAL,
      items TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      label TEXT,
      amount REAL,
      date TEXT,
      category TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const userExists = await get('SELECT id FROM users LIMIT 1');
  if (!userExists) {
    await run(
      'INSERT INTO users (id, name, role, email, password) VALUES (?, ?, ?, ?, ?)',
      [id('user'), 'Amélie N.', 'Owner', DEFAULT_LOGIN.email, DEFAULT_LOGIN.password]
    );

    await run(
      'INSERT INTO settings (id, storeName, city, currency, language, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [id('settings'), 'Petit Marché', 'Douala', 'FCFA', 'English', '+237 6XX XXX XXX']
    );

    const seedProducts = [
      ['Rice 25kg', 'Groceries', 18500, 3, 10],
      ['Vegetable Oil 5L', 'Groceries', 7200, 6, 8],
      ['Beaufort Lager', 'Beverages', 750, 24, 12],
      ['Mocaf Bread', 'Groceries', 500, 4, 10],
      ['Laundry Soap', 'Household', 900, 18, 8],
      ['Onions 1kg', 'Groceries', 1000, 7, 10],
      ['Water 1.5L', 'Beverages', 400, 36, 12],
      ['Toothpaste', 'Personal care', 1800, 2, 6]
    ];

    for (const item of seedProducts) {
      await run(
        'INSERT INTO products (id, name, category, price, stock, reorder) VALUES (?, ?, ?, ?, ?, ?)',
        [id('p'), item[0], item[1], item[2], item[3], item[4]]
      );
    }

    const seedCustomers = [
      ['Jean-Pierre Mbarga', '+237 656 123 456', 'Gold'],
      ['Amina Tchoua', '+237 677 987 654', 'Silver']
    ];

    for (const c of seedCustomers) {
      await run(
        'INSERT INTO customers (id, name, phone, loyalty) VALUES (?, ?, ?, ?)',
        [id('c'), c[0], c[1], c[2]]
      );
    }

    const seedSuppliers = [
      ['Bafoussam Food Hub', '+237 699 555 111', 'Nadine'],
      ['Douala Household Supply', '+237 690 222 333', 'Martin']
    ];

    for (const s of seedSuppliers) {
      await run(
        'INSERT INTO suppliers (id, name, phone, contact) VALUES (?, ?, ?, ?)',
        [id('s'), s[0], s[1], s[2]]
      );
    }

    await run(
      'INSERT INTO sales (id, reference, date, payment, customer, total, items) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id('sale'), 'SALE-1001', '2026-09-30', 'Mobile Money', 'Jean-Pierre Mbarga', 27000, JSON.stringify([{ name: 'Rice 25kg', quantity: 1, price: 18500 }, { name: 'Water 1.5L', quantity: 6, price: 400 }])]
    );

    await run(
      'INSERT INTO expenses (id, label, amount, date, category) VALUES (?, ?, ?, ?, ?)',
      [id('e'), 'Electricity bill', 22000, '2026-09-28', 'Utilities']
    );
  }
}

initDatabase().catch((err) => console.error('Init DB error:', err));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'MboaStock API is running' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (email === DEFAULT_LOGIN.email && password === DEFAULT_LOGIN.password) {
    const user = await get('SELECT name, role, email FROM users LIMIT 1');
    return res.json({ ok: true, user });
  }
  res.status(401).json({ ok: false, message: 'Invalid email or password' });
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const sales = await all('SELECT total FROM sales');
    const expenses = await all('SELECT amount FROM expenses');
    const products = await all('SELECT * FROM products');
    const customers = await all('SELECT * FROM customers');

    const totalSales = sales.reduce((sum, row) => sum + Number(row.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const lowStock = products.filter((product) => Number(product.stock) <= Number(product.reorder));

    res.json({
      totalSales,
      totalExpenses,
      netRevenue: totalSales - totalExpenses,
      lowStockCount: lowStock.length,
      productsCount: products.length,
      customersCount: customers.length,
      lowStock
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, category, price, stock, reorder } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Product name is required' });

    const product = {
      id: id('p'),
      name: String(name).trim(),
      category: category || 'Other',
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      reorder: Number(reorder) || 0
    };

    await run(
      'INSERT INTO products (id, name, category, price, stock, reorder) VALUES (?, ?, ?, ?, ?, ?)',
      [product.id, product.name, product.category, product.price, product.stock, product.reorder]
    );

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await run('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/sales', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM sales ORDER BY created_at DESC');
    res.json(rows.map((row) => ({ ...row, items: JSON.parse(row.items || '[]') })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/sales', async (req, res) => {
  try {
    const { selectedProductId, customer, payment = 'Cash', quantity } = req.body || {};
    const product = await get('SELECT * FROM products WHERE id = ?', [selectedProductId]);
    const qty = Number(quantity);

    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!Number.isInteger(qty) || qty < 1) return res.status(400).json({ message: 'Quantity must be a positive integer' });
    if (qty > Number(product.stock)) return res.status(400).json({ message: 'Not enough stock available' });

    const total = Number(product.price) * qty;
    const sale = {
      id: id('sale'),
      reference: `SALE-${String(Date.now()).slice(-6)}`,
      date: new Date().toISOString().slice(0, 10),
      payment,
      customer: customer || 'Walk-in customer',
      total,
      items: [{ name: product.name, quantity: qty, price: Number(product.price) }]
    };

    await run('UPDATE products SET stock = stock - ? WHERE id = ?', [qty, selectedProductId]);
    await run(
      'INSERT INTO sales (id, reference, date, payment, customer, total, items) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [sale.id, sale.reference, sale.date, sale.payment, sale.customer, sale.total, JSON.stringify(sale.items)]
    );

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, phone, loyalty } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Customer name is required' });

    const customer = { id: id('c'), name, phone, loyalty: loyalty || 'Bronze' };
    await run('INSERT INTO customers (id, name, phone, loyalty) VALUES (?, ?, ?, ?)', [customer.id, customer.name, customer.phone, customer.loyalty]);
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/suppliers', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM suppliers ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const { name, phone, contact } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Supplier name is required' });

    const supplier = { id: id('s'), name, phone, contact };
    await run('INSERT INTO suppliers (id, name, phone, contact) VALUES (?, ?, ?, ?)', [supplier.id, supplier.name, supplier.phone, supplier.contact]);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/purchases', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM purchases ORDER BY created_at DESC');
    res.json(rows.map((row) => ({ ...row, items: JSON.parse(row.items || '[]') })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/purchases', async (req, res) => {
  try {
    const { supplier_id, items = [], notes = '' } = req.body || {};
    const supplier = await get('SELECT * FROM suppliers WHERE id = ?', [supplier_id]);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    const total = (items || []).reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.price || 0)), 0);
    const purchase = {
      id: id('purchase'),
      supplier_id,
      reference: `PO-${String(Date.now()).slice(-6)}`,
      date: new Date().toISOString().slice(0, 10),
      status: 'Pending',
      total,
      items,
      notes
    };

    await run(
      'INSERT INTO purchases (id, supplier_id, reference, date, status, total, items, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [purchase.id, purchase.supplier_id, purchase.reference, purchase.date, purchase.status, purchase.total, JSON.stringify(purchase.items), purchase.notes]
    );

    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/purchases/:id', async (req, res) => {
  try {
    const { status } = req.body || {};
    const allowed = ['Pending', 'Received', 'Cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    await run('UPDATE purchases SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ ok: true, status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/expenses', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM expenses ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { label, amount, date, category } = req.body || {};
    if (!label) return res.status(400).json({ message: 'Expense label is required' });

    const expense = { id: id('e'), label, amount: Number(amount) || 0, date: date || new Date().toISOString().slice(0, 10), category: category || 'General' };
    await run('INSERT INTO expenses (id, label, amount, date, category) VALUES (?, ?, ?, ?, ?)', [expense.id, expense.label, expense.amount, expense.date, expense.category]);
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/reports', async (req, res) => {
  try {
    const sales = await all('SELECT total FROM sales');
    const expenses = await all('SELECT amount FROM expenses');
    const byPayment = await all('SELECT payment, COUNT(*) as count, SUM(total) as total FROM sales GROUP BY payment');
    const byDate = await all('SELECT date, SUM(total) as total FROM sales GROUP BY date ORDER BY date DESC LIMIT 30');

    const salesTotal = sales.reduce((sum, row) => sum + Number(row.total || 0), 0);
    const expenseTotal = expenses.reduce((sum, row) => sum + Number(row.amount || 0), 0);

    res.json({ salesTotal, expenseTotal, net: salesTotal - expenseTotal, salesByPayment: byPayment, salesByDate: byDate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const row = await get('SELECT * FROM settings ORDER BY rowid DESC LIMIT 1');
    res.json(row || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const { storeName, city, currency, language, phone } = req.body || {};
    const settings = await get('SELECT * FROM settings ORDER BY rowid DESC LIMIT 1');
    if (!settings) return res.status(404).json({ message: 'Settings not found' });

    await run(
      'UPDATE settings SET storeName = ?, city = ?, currency = ?, language = ?, phone = ? WHERE id = ?',
      [storeName, city, currency, language, phone, settings.id]
    );

    res.json({ storeName, city, currency, language, phone });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/receipt/:saleId', async (req, res) => {
  try {
    const sale = await get('SELECT * FROM sales WHERE id = ?', [req.params.saleId]);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });

    const settings = await get('SELECT * FROM settings ORDER BY rowid DESC LIMIT 1');
    const items = JSON.parse(sale.items || '[]');

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Receipt ${sale.reference}</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f8f7; margin: 0; padding: 30px; }
            .receipt { width: 420px; margin: 0 auto; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
            h1 { text-align: center; color: #0d6b5b; margin-bottom: 4px; }
            .meta { text-align: center; color: #71817c; font-size: 12px; margin: 2px 0; }
            .rule { border-top: 1px dashed #dfeae7; margin: 18px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { padding: 8px 0; border-bottom: 1px solid #edf2f1; }
            th { text-align: left; color: #71817c; }
            .right { text-align: right; }
            .total { font-weight: 700; }
            .footer { text-align: center; font-size: 11px; color: #71817c; margin-top: 16px; }
            @media print { body { background: white; } .receipt { box-shadow: none; } }
          </style>
        </head>
        <body>
          <div class="receipt">
            <h1>${settings?.storeName || 'MboaStock'}</h1>
            <div class="meta">${settings?.city || 'Douala'}, Cameroon</div>
            <div class="meta">Tel: ${settings?.phone || ''}</div>
            <div class="rule"></div>
            <div class="meta"><strong>Receipt: ${sale.reference}</strong></div>
            <div class="meta">Date: ${sale.date}</div>
            <div class="meta">Customer: ${sale.customer}</div>
            <div class="meta">Payment: ${sale.payment}</div>
            <div class="rule"></div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="right">Qty</th>
                  <th class="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="right">${item.quantity}</td>
                    <td class="right">${Number(item.price * item.quantity).toLocaleString()} FCFA</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="rule"></div>
            <table>
              <tr class="total">
                <td>TOTAL</td>
                <td class="right">${Number(sale.total).toLocaleString()} FCFA</td>
              </tr>
            </table>
            <div class="footer">Thank you for shopping with us!<br />MboaStock • Digital store management</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MboaStock server running on http://localhost:${PORT}`);
});
