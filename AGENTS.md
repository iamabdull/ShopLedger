# ShopLedger

## Stack
- Node.js, CommonJS JavaScript, Express 4, and body-parser for JSON requests.
- Browser UI is plain HTML, CSS, and JavaScript in `public/`, served as static files.
- Application records are stored in `data/db.json` through `lib/store.js`.

## Module map
- `routes/customers.js` — list customers and record Khata settlements.
- `routes/orders.js` — list, fetch, create, and cancel orders.
- `routes/products.js` — list/filter products and list active coupons.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and keyed data export.
- `lib/coupons.js` — normalize, validate, calculate, and list coupons.
- `lib/dates.js` — today's date, date key normalization, and fiscal year helper.
- `lib/inventory.js` — product lookup, sellable stock, checks, reserve/release, and summary.
- `lib/invoice.js` — calculate invoice figures and render printable invoice HTML.
- `lib/ledger.js` — customer balances, Khata charges/reversals, and settlements.
- `lib/orders.js` — add, fetch, cancel, and filter orders.
- `lib/pricing.js` — subtotal, coupon discount, and checkout totals.
- `lib/reports.js` — dashboard summary and invoice/ledger GST reconciliation.
- `lib/store.js` — read/write `data/db.json` and append bounded audit entries.
- `lib/tax.js` — resolve item GST rates/slabs and split CGST/SGST.

## Commands
- Start the app: `npm start`
- Run tests: `node --test`

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
Invoice total and GST breakdown do not match what the customer was billed.
Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
