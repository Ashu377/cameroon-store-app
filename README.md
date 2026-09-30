# MboaStock

MboaStock is a mobile-friendly store management app for small Cameroonian businesses.

## Current features

- Express backend with persistent JSON storage
- Dashboard with sales, revenue, customer, product, and low-stock metrics
- Product catalog with search and delete actions
- Sales recording with Cash, Mobile Money, and Orange Money options
- Automatic stock deduction and insufficient-stock validation
- Customer and supplier directories
- Reports and store settings
- FCFA currency and Cameroon-focused starter data

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm start
```

Open http://localhost:3000.

The API health check is available at http://localhost:3000/api/health.

## Demo data

Starter data is stored in `data/store.json`. This is intentionally a simple local development database; production deployment should replace it with a real database and add authentication, backups, and payment-provider credentials.

## Next production steps

- Secure authentication and role-based access
- PostgreSQL or managed database storage
- MTN Mobile Money and Orange Money provider integration
- Receipt printing, expenses, imports, backups, and French translations
