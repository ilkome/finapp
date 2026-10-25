# 9.0.0 (after 8.2.0)

## 📊 Statistics

- Saved views: build your own dashboards from report blocks and charts, switch between them, and sync them across devices.
- A built-in adaptive view; editing it forks it into your own copy.
- Blocks with rules: show or configure a block only for chosen wallets, categories or pages.
- Wallet and category pages get their own contextual views; category pages split the chart into income and expense.
- Adaptive charts, comparison tooltips, period controls and a summary total toggle.
- Select transactions in the stat list and edit them in bulk.
- Category and wallet statistics open in a sheet from the category cloud, the wallets list and the bottom menu, with date presets, the period and the filter at its bottom. Category sheets share one device setting, apart from the page's views.
- The description filter in the transactions block is a block setting, the total switch is on by default from 1000px wide, and the period button can reset the period.

## 🗃 Data model

- Transactions record what leaves a wallet and what enters one, money is stored in each currency's minor units, and ids are UUIDv7. Existing data moves over in one migration.
- The order of wallets and favorite categories syncs across devices.

## 📈 Wallets analytics (beta)

- An analytics page for wallets: net worth, change, savings rate and months of safety on top; cashflow with fixed and flexible spending; balance with lows, highs and an all-time high; shares, debts and credit card utilization; top movers, short insights, a bank balance check and a per-wallet table with sparklines.
- Charts compare with the previous period, open an interval's transactions from the tooltip, export to CSV and work from the keyboard.
- Forecast: walks day by day with detected pay days, marks the run-out, lists upcoming payments, shows months of cover, a what-if scenario and interest-free versus minimum credit card paths.
- Turn on in Settings → Beta → Wallets analytics and forecast.

## 💱 Currencies

- A currencies page: add, edit and reorder currencies, set how amounts in them look, and convert between them in a converter tab; currencies in use are grouped.

## 📡 Offline and sync

- Works offline first: changes are saved on the device and synced when the connection is back.
- The app shows when it is offline or has unsynced changes; sign-out warns before dropping unsynced data and only clears this device.
- On Chromium the local database lives in OPFS; other browsers keep IndexedDB.
- The installed app precaches less, reports when it is ready offline and updates with one restart.
- Push notifications.

## 🗂 History

- A transactions table with filters and bulk actions; all-time period by default, a description-only filter and filter pills.

## 💳 Loans (beta)

- Credit cards and loans: schedules, payments with interest, portfolio, payoff recommendation and what-if. Turn on in Settings → Beta → Loans and credit cards. See the credit and loans reference in the docs.
- Grace periods, payment reminders and forecast settings for credit products. The bank's figures for any wallet can be entered on its page.
- Due cards by month open the payments with the interest-free sum; the cost block opens the full cost with its transactions; a transfer into a credit wallet is labeled as a loan payment.

## ✉️ Email sign-in (beta)

- Sign in with a 6-digit code or a magic link from one email; the code works in any browser, including the installed app. Turn on in Settings → Beta → Sign in with an email code.

## ⚙️ Settings

- Sections as tabs: a side column on desktop, a scrolling strip on the phone.
- Appearance: theme, primary and background colors and corner radius are picked right on the page and preview live.
- Language picked right on the page.
- Sidebar tab: turn wallets and categories on separately, pick which ones show and drag them into order, or leave the automatic choice.
- Beta tab: features still in development, each turned on per device and off by default.
- Links to GitHub and the docs.
- Swipe between sections on phones.

## ✨ New

- Layout: one user menu on the header, sidebar and phone; a resizable sidebar with settings in its menu; demo actions on top of the menu.
- Wallets: cards with backgrounds, pinnable, sortable and hideable statistics rows, saved order everywhere, grouping controls in the header.
- Categories: view settings (background, children view and counts) and editable reserved categories.
- Forms: wallet and category forms open as a dialog on desktop; the phone keeps the bottom sheet.
- Filter: one sheet for picking wallets and categories, also used to pick a single item in the transaction form.
- Notifications stack, merge duplicates and can be swiped away.
- Page headers: one height on every page, actions in a pill on desktop and plain icons on the phone.
- Demo: every wallet type, debts both ways, crypto and random-currency wallets.
- Description: one sheet in the transaction form and in bulk edit, saved as you type, no save button.
- Transaction form: no history slide; it opens faster and the page behind it scales smoothly. Settings → Appearance can turn off the page scaling behind drawers.
- Drawers: swipes and closes no longer stutter, a nested sheet drags its parent along, a sheet reopens in place after a swipe, and filters and view settings apply once their sheet has closed. The menu's Color and Rounding panels open again.
- Calendar: follows the app language, and the period calendar shows two months side by side on desktop.
- Lists: inline sorting with handles, a drop line and cancel or apply; wallets group by combined options with separate archived and not-in-total groups and pinned titles; categories use one blocks view on the page and in pickers.
- Menus: the laptop user menu is built from nested menus; a context menu locks the page behind it and the browser's own menu stays hidden.
- Filter: search sits in each slide's toolbar; wallet and category pickers in the transaction form open half height and expand to full screen; wallet pickers filter by currency.
- Wallets summary: a donut with every slice, labels for large slices and the tapped slice in the center, or a bar chart.
- Transactions: a single transfer shows its amount on the right; a tap opens a transaction preview (beta: Settings → Beta → Transaction preview on tap).

## ⚡ Performance

- Pages kept in memory stop updating while hidden, so a transaction edit no longer re-renders them.
- Cold start paints saved views and data from a per-user snapshot before the database is ready.
- Sync reuses unchanged rows on every database emit and sends consecutive uploads in one request.
- Statistics aggregate category totals once per period set.
- Statistics charts draw on canvas, category views are built once per report, and a picked period or grouping shows before the recompute.
- Context menus, filter slides, the icon picker and currency lists mount on demand or in chunks; drawers drop a blur hidden under the overlay; bundled icons ship in one stylesheet.

## 🐛 Fixes

- Currencies: once exchange rates are loaded, an amount in a currency with no rate is left out of totals instead of being counted 1:1.
- Totals: a transaction whose wallet was deleted is skipped instead of being counted as dollars, matching wallet balances.
- Wallets: balances snap to the currency's minor unit (JPY to whole yen, BTC to 8 decimals).
- Statistics: chart amounts use one number style in every place and language.
- Statistics: picking a day or a range in the period calendar applies it instead of failing.
- Switches can be reached with Tab and toggled with Enter or Space.
- The installed app takes over the open page on its first install.
- Security: server functions check the service role by its key, not by an unverified token payload.
- Theme: the saved accent and radius apply before the first paint; the radius is square or rounded.
- Cold start no longer shows default settings before the user's settings are read.
- Amounts show a plus only when positive and update when a currency's display settings change.
- After a touch long-press, the first tap in the menu clicks.

## ♻️ Refactor

- Settings: device preferences move to one key prefix and reset once after this update.
- Pure views with Storybook stories; dead code, unused packages and the extension registry removed.

## 📝 Docs

- Guides rewritten against the current UI with new screenshots.
- Loans, reserved categories, validation schemas, sync, performance, testing, backups and minimum browser versions documented.
- The Telegram bot and AI chat pages are back as coming soon, free.
- Docs follow the new data model names.

## 🔧 Chore

- Nuxt 4.6.1 with Nuxt 5 compatibility, all packages updated; knip checks for dead code.
