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

## 🏞 Screenshot


<br/>

## 🚀 Features

### Finance
- **Wallets**: 6 types - cash, bank accounts, credit cards, deposits, crypto, debt
- **Transactions**: expense, income, transfer, adjustment with built-in calculator
- **Categories**: hierarchical (parent-child), custom icons and colors
- **Multi-currency**: 165+ currencies with automatic daily exchange rates

### Analytics
- Dashboard with summary, expense, income tabs
- Bar and line charts with average line
- Flexible date ranges: day, week, month, year, custom period
- Category breakdown with multiple display modes (list, icons, chart)
- Multi-select filters by wallet and category

### Offline & Sync
- Offline-first PWA - fully functional without internet
- Offline queue with automatic sync on reconnect
- Real-time sync across devices via Convex

### Customization
- Light, Dark, and System color modes
- 20+ primary colors and 5 neutral palettes
- Adjustable border radius
- Per-tab dashboard widget configuration
- English and Russian interface

### Other
- Demo mode with sample data - no registration required
- Google OAuth authentication

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
npx convex env set BETTER_AUTH_SECRET your_secret
npx convex env set APP_URL https://your-app-domain.com
npx convex env set GOOGLE_CLIENT_ID your_client_id
npx convex env set GOOGLE_CLIENT_SECRET your_client_secret
npx convex env set OPEN_EXCHANGE_RATES_KEY your_app_id
```

- **BETTER_AUTH_SECRET**: Required — without it all auth endpoints including CORS preflight will fail

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

## 📌 Previous Version

The previous version of Finapp (built on Firebase) is available in the [`firebase`](https://github.com/ilkome/finapp/tree/firebase) branch.

## 🤝 Stay Connected
- Telegram: [@ilkome](https://t.me/ilkome)
