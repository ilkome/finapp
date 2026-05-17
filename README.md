<p align="center">
  <img src="https://finapp.ilko.me/logo.png" alt="Finapp Logo" width="320" />
</p>

> [!WARNING]
> **This branch is the legacy v6 Firebase version of Finapp and is no longer maintained.**
> The current version is built on Convex and lives on the [`main`](https://github.com/ilkome/finapp/tree/main) branch.
> A migration guide from Firebase to Convex is available in the [docs](https://github.com/ilkome/finapp/blob/main/docs/content/en/2.development/03.migration.md).

# Finapp — Open Source Finance App
> Your money, your control — anywhere, anytime.

**Finapp** helps you easily track and manage personal finances.

<br/>

## ✨ Why Finapp?

- **Simple**: No clutter, no distractions — just your transactions and balances.
- **Fast**: Works offline and syncs instantly across devices.
- **Private**: You own your data — securely stored via Firebase.
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
- Instant real-time sync across devices (Firebase).
- Mobile-first, but optimized for desktop.
- Dark and Light theme support.
- Multi-currency with automatic exchange rates.

<br/>

## 🦄 Tech Stack
- Vue 3
- Nuxt 3
- TailwindCSS 4
- Firebase
- Progressive Web App

<br/>

## 📦 Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/ilkome/finapp.git finapp
cd finapp
pnpm install
```

### 2. Setup Firebase
- Create a project in [Firebase Console](https://console.firebase.google.com/).
- Enable **Realtime Database**.
- Set Database Rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "currencies": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "ratesUsd": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

- Register a **Web App** in Firebase and copy the config.
- Replace the contents of `services/firebase/config.js` with your config:

```js
export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  databaseURL: 'YOUR_DATABASE_URL',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET'
}
```

### 3. Enable Google Authentication
- In Firebase Console → Authentication → Sign-in method → Enable **Google** provider.

### 4. Authorize Your Domain (optional)
- Add your domain under Authentication → Sign-in method → Authorized domains.

### 5. Setup Open Exchange Rates
- Sign up at [openexchangerates.org](https://openexchangerates.org/signup/free) and get an **App ID**.
- Rename `.env.example` to `.env` and set your App ID:

```bash
OPEN_EXCHANGE_RATES=your_app_id
```

<br/>

## 🛠 Development

Run local server with hot reload:

```bash
pnpm dev
```

<br/>

## 🚀 Production

Generate static files for deployment:

```bash
pnpm generate
```

Then upload everything in .output/public to any static hosting.

<br/>

> **Tip**: Use services like Vercel or Netlify for automatic deployments.

## 🤝 Stay Connected
- Telegram: [@ilkome](https://t.me/ilkome)
