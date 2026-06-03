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
    date: column.integer,
    desc: column.text,
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

const user_settings = new Table({
  baseCurrency: column.text,
  locale: column.text,
  userId: column.text,
})

const rates = new Table({
  date: column.text,
  rates: column.text, // JSON-encoded Record<currency, number>
  source: column.text,
  updatedAt: column.integer,
})

export const AppSchema = new Schema({
  categories,
  rates,
  trns,
  user_settings,
  wallets,
})

export type AppDatabase = (typeof AppSchema)['types']
