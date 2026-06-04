<p align="center">
  <img src="https://finapp.ilko.me/logo.png" alt="Finapp Logo" width="320" />
</p>

# Finapp - Open Source Finance App

**English** | [Русский](./README.ru.md)

> Your money, your control - anywhere, anytime.

**Finapp** helps you easily track and manage personal finances. The repository is a pnpm monorepo with the Nuxt application and the documentation site.

## Live Demo

[finapp.ilko.me](https://finapp.ilko.me/)

## Documentation

[finapp-docs.ilko.me](https://finapp-docs.ilko.me/)

## Knowledge Graph

Interactive map of the codebase architecture: [finapp-graph.ilko.me/en](https://finapp-graph.ilko.me/en/)

## Why Finapp?

- **Simple**: No clutter, no distractions - just your transactions and balances.
- **Fast**: Works offline and syncs instantly across devices.
- **Private**: You own your data - stored locally first and synced through your own Supabase backend.
- **Flexible**: Supports multiple currencies with automatic exchange rates.
- **Portable**: Optimized for mobile and desktop, installable as a PWA.

## Features

### Finance

- **Wallets**: 6 types - cash, bank accounts, credit cards, deposits, crypto, debt.
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
- Local-first SQLite storage with automatic background sync on reconnect.
- Real-time sync across devices via PowerSync.

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
- Supabase (Postgres)
- PowerSync
- Supabase Auth
- Docus
- pnpm workspaces

## Repository Structure

```text
finapp/
  app/    # Nuxt application, Supabase + PowerSync config, tests, app assets
  docs/   # Docus documentation site
```

The root package contains workspace scripts only. App and docs dependencies are kept in their own package manifests.

## Getting Started

### Requirements

- Node.js `>=24.12.0`
- pnpm `10.x`
- Docker and the [Supabase CLI](https://supabase.com/docs/guides/cli) for the local backend

### Install

```bash
git clone https://github.com/ilkome/finapp.git finapp
cd finapp
pnpm install
```

### Configure the app

Copy the app environment example and fill in your Supabase and PowerSync values:

```bash
cp app/.env.example app/.env
```

Required environment variables:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_POWERSYNC_URL=your_powersync_url
```

For local development these point at the local stack started below: Supabase on `http://localhost:54321` and PowerSync on `http://localhost:8080`.

### Local backend

The backend is local self-hosted Supabase (Postgres + Auth) plus a self-hosted PowerSync service. Run these once from the `app/` workspace:

```bash
cd app

# 1. Start Supabase (Postgres + Auth on :54321)
supabase start

# 2. Apply the PowerSync replication setup (role + publication)
docker exec -i supabase_db_app psql -U postgres -d postgres < supabase/powersync_setup.sql

# 3. Start the PowerSync service (:8080)
docker compose -f powersync/docker-compose.yaml up -d
```

Auth supports **email/password** and **Sign in with Google**. Email/password works out of the box - sign up from the login screen, or create an account with the Supabase CLI.

### Google sign-in (optional, local)

The login screen shows a **Sign in with Google** button. To make it work against the local stack:

1. In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth 2.0 Client ID** (Web application) and add the local Supabase callback as an authorized redirect URI:

   ```text
   http://127.0.0.1:54321/auth/v1/callback
   ```

2. Put the client id/secret in `app/.env` (the Supabase CLI loads `.env` from the directory you run it in; these feed `env()` in `app/supabase/config.toml` and are **not** shipped to the client):

   ```bash
   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id
   SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_client_secret
   ```

3. Restart Supabase so it re-reads the config and env (`supabase stop && supabase start`).

The Google provider is already enabled in `app/supabase/config.toml` (`[auth.external.google]`, `skip_nonce_check = true` for local). Leaving the env vars empty just keeps the button non-functional - email/password still works. For **production**, configure Google in the hosted Supabase dashboard instead (see [Deployment](docs/content/en/2.development/05.deployment.md)).

### Environment files

The app workspace uses several `.env` files (all gitignored except `.env.example`):

| File | Purpose |
| --- | --- |
| `app/.env` | Dev values, read by Nuxt |
| `app/.env.prod` | Prod values, used by `pnpm dev:prod` |

## Development

With the local backend running, start the Nuxt app:

```bash
pnpm dev
```

The app runs at `http://localhost:3050`.

Run the documentation site:

```bash
pnpm docs:dev
```

The docs run at `http://localhost:3051`.

Run the app and docs dev servers together:

```bash
pnpm dev:all
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the app dev server |
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

User guides, development notes, and technical reference live in [`docs/content`](docs/content). 
Start the docs site with `pnpm docs:dev`.

## Previous Version

The previous version of Finapp, built on Firebase, is available in the [`firebase`](https://github.com/ilkome/finapp/tree/firebase) branch.

## Stay Connected

- Telegram: [@ilkome](https://t.me/ilkome)
