# Unreleased (after 8.3.0-beta.231)

## 💳 Loans (beta)

- Credit cards and loans: schedules, payments with interest, portfolio, payoff recommendation and what-if. See the credit and loans reference in the docs.

## ✨ New

- Settings: wallets and categories in the sidebar are turned on separately; pick which ones show and drag them into order, or leave the automatic choice.
- Forms: wallet and category forms open as a dialog on desktop, like the loan forms; the phone keeps the bottom sheet.

## ⚡ Performance

- Sync: unchanged wallets, categories and loans are reused on every database emit; consecutive uploads go in one request.
- Statistics: category totals for the chart and pies are aggregated once per period set.

## 🐛 Fixes

- Currencies: once exchange rates are loaded, an amount in a currency with no rate is left out of totals instead of being counted 1:1.
- Totals: a transaction whose wallet was deleted is skipped instead of being counted as dollars, matching wallet balances.
- Wallets: balances snap to the currency's minor unit (JPY to whole yen, BTC to 8 decimals) instead of at least two decimals.
- Statistics: chart amounts use one number style in every place and language (space thousands), so a tooltip and a point label no longer differ.
- Sync: the status badge keeps tracking sign-out and sign-in after a layout switch, and stops polling once signed out.
- Settings: switches can be reached with Tab and toggled with Enter or Space.

## ♻️ Refactor

- Settings: device preferences (collapsed sections, wallet grouping and sorting, statistics filters and periods) move to one key prefix and reset once after this update.
- App: dead code, unused exports and the extension registry are removed.

## 📝 Docs

- Docs: loans, reserved categories, validation schemas, vitest projects and backups are documented.
- Docs: the Telegram bot and AI chat pages are back as coming soon, free.

## 🔧 Chore

- Deps: Nuxt 4.6.1; unused fuse.js, gsap, vaul-vue and workbox packages removed.
