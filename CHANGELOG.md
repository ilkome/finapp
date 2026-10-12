# 9.0.0 (after 8.2.0)

## 📊 Statistics

- Saved views: build your own dashboards from report blocks and charts, switch between them, and sync them across devices.
- A built-in adaptive view; editing it forks it into your own copy.
- Blocks with rules: show or configure a block only for chosen wallets, categories or pages.
- Wallet and category pages get their own contextual views; category pages split the chart into income and expense.
- Adaptive charts, comparison tooltips, period controls and a summary total toggle.
- Select transactions in the stat list and edit them in bulk.

## 📡 Offline and sync

- Works offline first: changes are saved on the device and synced when the connection is back.
- The app shows when it is offline or has unsynced changes; sign-out warns before dropping unsynced data and only clears this device.
- On Chromium the local database lives in OPFS; other browsers keep IndexedDB.
- The installed app precaches less, reports when it is ready offline and updates with one restart.
- Push notifications.

## 🗂 History

- A transactions table with filters and bulk actions; all-time period by default, a description-only filter and filter pills.

## 💳 Loans (beta)

- Credit cards and loans: schedules, payments with interest, portfolio, payoff recommendation and what-if. See the credit and loans reference in the docs.

## ✉️ Email sign-in (beta)

- Sign in with a 6-digit code or a magic link from one email; the code works in any browser, including the installed app.

## ⚙️ Settings

- Sections as tabs: a side column on desktop, a scrolling strip on the phone.
- Appearance: theme, primary and background colors and corner radius are picked right on the page and preview live.
- Language picked right on the page.
- Sidebar tab: turn wallets and categories on separately, pick which ones show and drag them into order, or leave the automatic choice.
- Beta tab for features still in development.
- Links to GitHub and the docs.

## ✨ New

- Layout: one user menu on the header, sidebar and phone; a resizable sidebar with settings in its menu; demo actions on top of the menu.
- Wallets: cards with backgrounds, pinnable, sortable and hideable statistics rows, saved order everywhere, grouping controls in the header.
- Categories: view settings (background, children view and counts) and editable reserved categories.
- Forms: wallet and category forms open as a dialog on desktop; the phone keeps the bottom sheet.
- Filter: one sheet for picking wallets and categories, also used to pick a single item in the transaction form.
- Notifications stack, merge duplicates and can be swiped away.
- Page headers: one height on every page, actions in a pill on desktop and plain icons on the phone.
- Demo: every wallet type, debts both ways, crypto and random-currency wallets.

## ⚡ Performance

- Pages kept in memory stop updating while hidden, so a transaction edit no longer re-renders them.
- Cold start paints saved views and data from a per-user snapshot before the database is ready.
- Sync reuses unchanged rows on every database emit and sends consecutive uploads in one request.
- Statistics aggregate category totals once per period set.

## 🐛 Fixes

- Currencies: once exchange rates are loaded, an amount in a currency with no rate is left out of totals instead of being counted 1:1.
- Totals: a transaction whose wallet was deleted is skipped instead of being counted as dollars, matching wallet balances.
- Wallets: balances snap to the currency's minor unit (JPY to whole yen, BTC to 8 decimals).
- Statistics: chart amounts use one number style in every place and language.
- Switches can be reached with Tab and toggled with Enter or Space.
- The installed app takes over the open page on its first install.

## ♻️ Refactor

- Settings: device preferences move to one key prefix and reset once after this update.
- Pure views with Storybook stories; dead code, unused packages and the extension registry removed.

## 📝 Docs

- Guides rewritten against the current UI with new screenshots.
- Loans, reserved categories, validation schemas, sync, performance, testing, backups and minimum browser versions documented.
- The Telegram bot and AI chat pages are back as coming soon, free.

## 🔧 Chore

- Nuxt 4.6.1 with Nuxt 5 compatibility, all packages updated; knip checks for dead code.
