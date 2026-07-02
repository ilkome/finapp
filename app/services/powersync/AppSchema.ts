import { column, Schema, Table } from '@powersync/web'

// Client-side SQLite schema, mirroring the Supabase Postgres tables. PowerSync adds the
// implicit `id` text PK. Booleans are stored as 0/1 and timestamps as ms-epoch ints;
// camelCase columns match Postgres (cast at the hydration boundary, see transforms.ts).

const categories = new Table(
  {
    color: column.text,
    icon: column.text,
    name: column.text,
    parentId: column.text, // null = root (mapped to 0 in the client item shape)
    showInLastUsed: column.integer,
    showInQuickSelector: column.integer,
    updatedAt: column.integer,
    userId: column.text,
  },
  { indexes: { user: ['userId'] } },
)

const wallets = new Table(
  {
    color: column.text,
    creditLimit: column.real,
    currency: column.text,
    desc: column.text,
    isArchived: column.integer,
    isExcludeInTotal: column.integer,
    isWithdrawal: column.integer,
    name: column.text,
    order: column.integer,
    type: column.text,
    updatedAt: column.integer,
    userId: column.text,
  },
  { indexes: { user: ['userId'] } },
)

const trns = new Table(
  {
    amount: column.real,
    categoryId: column.text,
    date: column.integer, // civil day: UTC-midnight ms-epoch
    desc: column.text,
    enteredAt: column.integer, // original entry instant (audit/ordering only)
    expenseAmount: column.real,
    expenseWalletId: column.text,
    incomeAmount: column.real,
    incomeWalletId: column.text,
    recurrenceId: column.text, // set when generated/confirmed for a recurrence
    type: column.integer,
    updatedAt: column.integer,
    userId: column.text,
    walletId: column.text,
  },
  { indexes: { user: ['userId'], userDate: ['userId', 'date'] } },
)

const recurrences = new Table(
  {
    amount: column.real,
    amountHistory: column.text, // JSON array of { from: civilDay, amount } (price history)
    anchorDate: column.integer, // civil day (UTC-midnight ms-epoch)
    autoCreate: column.integer, // 0/1
    categoryId: column.text,
    desc: column.text,
    endCount: column.integer,
    endDate: column.integer,
    endMode: column.text, // never | date | count
    freq: column.text, // day | week | month | year
    interval: column.integer,
    lastGeneratedDate: column.integer,
    monthLastDay: column.integer, // 0/1
    skipDates: column.text, // JSON array of YYYY-MM-DD day keys
    status: column.text, // active | paused | cancelled
    type: column.integer, // 0 expense | 1 income
    updatedAt: column.integer,
    userId: column.text,
    walletId: column.text,
  },
  { indexes: { user: ['userId'] } },
)

const budgets = new Table(
  {
    amount: column.real, // default planned amount per period (base currency)
    amountPeriod: column.text, // week | month | year - the cadence `amount` is expressed in
    bucket: column.text, // need | want | savings (50/30/20)
    categoryId: column.text, // budgeted category (parent rolls up its subtree)
    currency: column.text, // currency `amount` is stated in (base at creation); converted at read
    goalAmount: column.real, // sinking-fund target (later phase)
    goalDate: column.integer, // sinking-fund target date (later phase)
    kind: column.text, // expense | income
    rollover: column.text, // none | surplus | surplus_deficit
    status: column.text, // active | archived
    updatedAt: column.integer,
    userId: column.text,
  },
  { indexes: { user: ['userId'] } },
)

const budget_assignments = new Table(
  {
    assigned: column.real, // assigned for that specific period (base currency)
    budgetId: column.text,
    periodStart: column.integer, // ms epoch, normalized to the period start
    updatedAt: column.integer,
    userId: column.text,
  },
  { indexes: { budgetPeriod: ['userId', 'budgetId', 'periodStart'], user: ['userId'] } },
)

const user_settings = new Table({
  baseCurrency: column.text,
  locale: column.text,
  timezone: column.text, // IANA tz captured at entry; used by the civil-date backfill
  userId: column.text,
})

const rates = new Table({
  date: column.text,
  rates: column.text, // JSON-encoded Record<currency, number>
  source: column.text,
  updatedAt: column.integer,
})

export const AppSchema = new Schema({
  budget_assignments,
  budgets,
  categories,
  rates,
  recurrences,
  trns,
  user_settings,
  wallets,
})
