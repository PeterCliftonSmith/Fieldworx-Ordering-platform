# Fieldworx Ordering Platform

Created for restaurateurs to order directly from suppliers using the website as a middleman.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the customer site.

## Admin catalogue

Manage suppliers and products at [http://localhost:3000/admin](http://localhost:3000/admin).

1. Sign in with the admin password
2. Add, edit, or remove suppliers
3. Edit each supplier’s product list (name, category, unit, price)

Default demo password: `fieldworx-admin`

Optional environment variables (see `.env.example`):

- `ADMIN_PASSWORD` — replaces the default password
- `ADMIN_SESSION_SECRET` — used to sign the admin session cookie

Catalogue data is stored in `data/catalog.json`. The customer-facing pages read from the same file, so admin edits show up on the site immediately after refresh.

## What’s included

- Customer landing, suppliers, catalogues, draft order, and how-it-works
- Password-protected admin for supplier and product CRUD
- Sample South African trade catalogue (ZAR)

This is still a demo scaffold — orders stay in the browser, and admin auth is a simple shared password meant for local/trusted use.

Product prices are stored excluding and including VAT (default 15%). In admin, editing one amount auto-fills the other.
