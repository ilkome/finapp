<p align="center">
  <img src="https://finapp.ilko.me/logo.png" alt="Finapp Logo" width="320" />
</p>

# Finapp — Open Source Finance App

> Your money, your control — anywhere, anytime.

**Finapp** helps you easily track and manage personal finances. The repository is a pnpm monorepo with the Nuxt application and the documentation site.

## Live Demo

[finapp.ilko.me](https://finapp.ilko.me/)

## Why Finapp?

- **Simple**: No clutter, no distractions — just your transactions and balances.
- **Fast**: Works offline and syncs instantly across devices.
- **Private**: You own your data — securely stored via Convex.
- **Flexible**: Supports multiple currencies with automatic exchange rates.
- **Portable**: Optimized for mobile and desktop, installable as a PWA.

## Features

### Finance

- **Wallets**: 6 types — cash, bank accounts, credit cards, deposits, crypto, debt.
- **Transactions**: expense, income, transfer, adjustment with a built-in calculator.
- **Categories**: hierarchical parent-child categories with custom icons and colors.
- **Multi-currency**: 165+ currencies with automatic daily exchange rates.

### Analytics

- Dashboard with summary, expense, and income tabs.
- Bar and line charts with an average line.
- Flexible date ranges: day, week, month, year, or custom period.
- Category breakdown with multiple display modes.
- Multi-select filters by wallet and category.

### Offline & Sync

- Offline-first PWA that works without an internet connection.
- Offline queue with automatic sync on reconnect.
- Real-time sync across devices via Convex.

### Customization

- Light, Dark, and System color modes.
- 20+ primary colors and 5 neutral palettes.
- Adjustable border radius.
- Per-tab dashboard widget configuration.
- English and Russian interface.

## Tech Stack

- Vue 3
- Nuxt 4
- Pinia
- @nuxt/ui v4 and Tailwind CSS v4
- Convex
- Better Auth
- Docus
- pnpm workspaces

## Repository Structure

```text
finapp/
  app/    # Nuxt application, Convex backend, tests, app assets
  docs/   # Docus documentation site
```

The root package contains workspace scripts only. App and docs dependencies are kept in their own package manifests.

## Getting Started

### Requirements

- Node.js `>=24.12.0`
- pnpm `10.x`
- A Convex project for local backend development

### Install

```bash
git clone https://github.com/ilkome/finapp.git finapp
cd finapp
pnpm install
```

### Configure the app

Copy the app environment example and fill in your Convex deployment values:

```bash
cp app/.env.example app/.env
```

Required Nuxt environment variables:

```bash
CONVEX_DEPLOYMENT=your_deployment
VITE_CONVEX_URL=your_convex_url
VITE_CONVEX_SITE_URL=your_convex_site_url
```

Set Convex backend environment variables from the app workspace:

```bash
pnpm --filter @finapp/app exec convex env set BETTER_AUTH_SECRET your_secret
pnpm --filter @finapp/app exec convex env set APP_URL http://localhost:3050
pnpm --filter @finapp/app exec convex env set GOOGLE_CLIENT_ID your_client_id
pnpm --filter @finapp/app exec convex env set GOOGLE_CLIENT_SECRET your_client_secret
pnpm --filter @finapp/app exec convex env set OPEN_EXCHANGE_RATES_KEY your_app_id
```

`BETTER_AUTH_SECRET` is required. Without it, auth endpoints, including CORS preflight requests, will fail.

## Development

Run the Convex backend and the Nuxt app in separate terminals:

```bash
pnpm dev:convex
```

```bash
pnpm dev
```

The app runs at `http://localhost:3050`.

Run the documentation site:

```bash
pnpm docs:dev
```

The docs run at `http://localhost:3051`.

Run app and docs dev servers together. Convex still runs separately with `pnpm dev:convex`.

```bash
pnpm dev:all
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the app dev server |
| `pnpm dev:convex` | Start the Convex dev backend |
| `pnpm docs:dev` | Start the documentation dev server |
| `pnpm dev:all` | Start app and docs dev servers in parallel |
| `pnpm build` | Build all workspace packages that define `build` |
| `pnpm generate` | Generate the app for static hosting |
| `pnpm docs:build` | Build the documentation site |
| `pnpm lint` | Run root-owned linting for the monorepo |
| `pnpm lint:app` | Run linting for the app package |
| `pnpm lint:docs` | Run linting for the docs package |
| `pnpm lint:fix` | Run linting with automatic fixes |
| `pnpm test` | Run tests in workspace packages |
| `pnpm typecheck` | Run type checks in workspace packages |

## Documentation

User guides, development notes, and technical reference live in [`docs/content`](docs/content). Start the docs site with `pnpm docs:dev`.

## Previous Version

The previous version of Finapp, built on Firebase, is available in the [`firebase`](https://github.com/ilkome/finapp/tree/firebase) branch.

## Stay Connected

- Telegram: [@ilkome](https://t.me/ilkome)
