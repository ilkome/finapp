<p align="center">
  <img src="https://finapp.ilko.me/logo.png" alt="Finapp Logo" width="320" />
</p>

# Finapp — Open Source Finance App
> Your money, your control — anywhere, anytime.

**Finapp** helps you easily track and manage personal finances.

<br/>

## ✨ Why Finapp?

- **Simple**: No clutter, no distractions — just your transactions and balances.
- **Fast**: Works offline and syncs instantly across devices.
- **Private**: You own your data — securely stored via Convex.
- **Flexible**: Supports multiple currencies with automatic exchange rates.
- **Portable**: Optimized for mobile and desktop, installable as a PWA.

<br/>

## 🕹 Live Demo
➡️ [finapp.ilko.me](https://finapp.ilko.me/)

<br/>

## 🏞 Screenshots
![Finapp 2.0.0](https://firebasestorage.googleapis.com/v0/b/finapp-17474.appspot.com/o/2.0.0%2Ffinapp-2.0.0-promo.png?alt=media&token=bce821da-f5fa-4e8a-be7a-8fc0ebfaf260)

<br/>

## 🚀 Features
- Offline-first (PWA) with full CRUD support.
- Instant sync across devices (Convex).
- Mobile-first, but optimized for desktop.
- Dark and Light theme support.
- Multi-currency with automatic exchange rates.

<br/>

## 🦄 Tech Stack
- Vue 3
- Nuxt 4
- Pinia
- @nuxt/ui v4 (Tailwind CSS v4)
- Convex (backend)
- Better Auth (authentication)
- Progressive Web App

<br/>

## 📦 Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/ilkome/finapp.git finapp
cd finapp
pnpm install
```

### 2. Setup Convex
- Create a project at [convex.dev](https://www.convex.dev/).
- Copy `.env.example` to `.env` and fill in:

```bash
CONVEX_DEPLOYMENT=your_deployment
VITE_CONVEX_URL=your_convex_url
VITE_CONVEX_SITE_URL=your_convex_site_url
```

### 3. Setup Convex Environment Variables

These variables run on the Convex backend. Set them via CLI:

```bash
npx convex env set SITE_URL your_convex_site_url
npx convex env set FRONTEND_URL https://your-app-domain.com
npx convex env set GOOGLE_CLIENT_ID your_client_id
npx convex env set GOOGLE_CLIENT_SECRET your_client_secret
npx convex env set OPENEXCHANGERATES_APP_ID your_app_id
```

- **Google OAuth**: Create credentials in [Google Cloud Console](https://console.cloud.google.com/)
- **Exchange rates**: Sign up at [openexchangerates.org](https://openexchangerates.org/signup/free)

<br/>

## 🛠 Development

Run local server with hot reload:

```bash
pnpm dev
```

Run Convex dev server (in a separate terminal):

```bash
pnpm dev:convex
```

<br/>

## 🚀 Production

Build for production:

```bash
pnpm build
```

Or generate static files for static hosting:

```bash
pnpm generate
```

## 📚 Documentation

Documentation site built with [Docus](https://docus.dev/). Run locally with `pnpm docs:dev`.

### For users
- [User Guide](docs/content/en/1.guide/index.md) — features, navigation, wallets, categories, transactions, statistics, settings

### For developers
- [Architecture](docs/content/en/2.architecture/index.md) — initialization flow, project structure, store pattern, client access, auth
- [Transaction Types](docs/content/en/3.transaction-types/index.md) — types, adjustment logic, statistics
- [Incremental Sync](docs/content/en/4.sync/index.md) — delta sync, deletion detection, performance
- [Offline Queue](docs/content/en/5.offline-queue/index.md) — queue architecture, collapsing rules, sync scenarios
- [Technical Decisions](docs/content/en/6.tech/index.md) — rationale behind key design choices

## 🤝 Stay Connected
- Telegram: [@ilkome](https://t.me/ilkome)
