# MboaStock

A friendly, mobile-first store management dashboard for small businesses in Cameroon. MboaStock helps shop owners see sales performance, track stock, and manage their catalog from one simple workspace.

## Included in this first build

- Responsive dashboard with sales, order, customer, and low-stock metrics
- Sales performance chart and recent activity feed
- Inventory alerts with stock-level indicators
- Product catalog with search and categories
- Add-product flow with FCFA pricing and local browser persistence
- Mobile navigation and a foundation for sales, customer, reports, and settings modules
- Cameroonian context: FCFA currency, Douala store location, and familiar product examples

## Run locally

This is a zero-build static app. Open `index.html` in a browser, or serve the directory with any static server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Roadmap

Next steps include authentication, real sales recording, Mobile Money integrations (MTN MoMo / Orange Money), printable receipts, supplier management, multilingual English/French UI, and a hosted database/API.
