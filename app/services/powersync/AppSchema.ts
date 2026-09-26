import { column, Schema, Table } from '@powersync/common'

// Client-side SQLite schema, mirroring the Supabase Postgres tables. PowerSync adds the
// implicit `id` text PK. Booleans are stored as 0/1 and timestamps as ms-epoch ints;
// camelCase columns match Postgres (cast at the hydration boundary, see transforms.ts).

const categories = new Table(
  {
    color: column.text,
    icon: column.text,
    isExcludeFromStats: column.integer, // 0/1 - drop from dashboard stats/charts
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
    minPaymentAmount: column.real,
    minPaymentDate: column.integer, // civil day
    minPaymentUpdatedAt: column.integer,
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
    type: column.integer,
    updatedAt: column.integer,
    userId: column.text,
    walletId: column.text,
  },
  { indexes: { user: ['userId'], userDate: ['userId', 'date'] } },
)

const loans = new Table(
  {
    annualRate: column.real,
    bankDebtAmount: column.real,
    bankDebtUpdatedAt: column.integer,
    contractNumber: column.text,
    debitWalletId: column.text,
    desc: column.text,
    firstPaymentDate: column.integer, // civil day
    interestMethod: column.text,
    lateAfterDays: column.integer,
    nextPaymentDate: column.integer, // civil day
    nextPaymentInterest: column.real,
    nextPaymentPrincipal: column.real,
    overpaymentMode: column.text,
    paymentDay: column.integer,
    prepayWindowDays: column.integer,
    principalAmount: column.real,
    scheduleType: column.text,
    startDate: column.integer, // civil day
    termMonths: column.integer,
    updatedAt: column.integer,
    userId: column.text,
    walletId: column.text,
  },
  { indexes: { user: ['userId'] } },
)

// Only imported or hand-edited rows; a generated row is represented by its absence.
const loan_schedule_rows = new Table(
  {
    date: column.integer, // civil day
    interestPart: column.real,
    loanId: column.text,
    paymentNumber: column.integer,
    principalPart: column.real,
    source: column.text,
    totalAmount: column.real,
    updatedAt: column.integer,
    userId: column.text,
  },
  { indexes: { loan: ['userId', 'loanId'], user: ['userId'] } },
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

const stat_views = new Table({
  autoRule: column.text,
  config: column.text,
  createdAt: column.integer,
  isActive: column.integer,
  isAutoEnabled: column.integer,
  name: column.text,
  scope: column.text,
  sortOrder: column.integer,
  updatedAt: column.integer,
  userId: column.text,
}, { indexes: { userScopeOrder: ['userId', 'scope', 'sortOrder'] } })

export const AppSchema = new Schema({
  categories,
  loan_schedule_rows,
  loans,
  rates,
  stat_views,
  trns,
  user_settings,
  wallets,
})
