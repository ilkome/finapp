import type { Database } from '~~/services/supabase/database.types'

/**
 * Every synced column and its kind. `AppSchema`, the row <-> item mapping and the JSON columns of the upload are
 * built from it; the type check at the bottom keeps it equal to the generated Postgres types.
 * `money` is integer minor units of the row's currency, `day` a civil day (UTC-midnight ms), `instant` ms.
 */
export type ColumnKind = 'bool' | 'day' | 'instant' | 'int' | 'json' | 'money' | 'real' | 'text' | 'uuid'

const owned = { created_at: 'instant', updated_at: 'instant', user_id: 'uuid' } as const

export const TABLE_COLUMNS = {
  bank_reports: {
    ...owned,
    balance_amount: 'money',
    balance_date: 'day',
    debt_amount: 'money',
    debt_report_date: 'day',
    grace_debt_amount: 'money',
    grace_end_date: 'day',
    min_payment_amount: 'money',
    min_payment_due_date: 'day',
    min_payment_period_start_date: 'day',
    next_interest_amount: 'money',
    next_payment_date: 'day',
    next_principal_amount: 'money',
    statement_date: 'day',
  },
  categories: {
    ...owned,
    color: 'text',
    icon: 'text',
    is_excluded_from_stats: 'bool',
    is_in_quick_selector: 'bool',
    is_in_recent: 'bool',
    name: 'text',
    parent_id: 'uuid',
    sort_order: 'int',
  },
  currencies: {
    ...owned,
    code: 'text',
    manual_rate: 'real',
    manual_rate_currency_code: 'text',
    minor_display: 'text',
    name: 'text',
    scale: 'int',
    symbol: 'text',
  },
  display_overrides: {
    ...owned,
    color: 'text',
    icon: 'text',
    kind: 'text',
    name: 'text',
    parent_id: 'uuid',
    target_id: 'text',
  },
  exchange_rates: {
    date: 'day',
    rates: 'json',
    source: 'text',
    updated_at: 'instant',
  },
  forecast_categories: {
    ...owned,
    category_id: 'text',
    currency_code: 'text',
    is_included: 'bool',
    monthly_amount: 'money',
  },
  forecast_settings: {
    ...owned,
    card_payment_mode: 'text',
    history_months: 'int',
    horizon_months: 'int',
    is_by_parent_category: 'bool',
    regular_amount_mode: 'text',
    regular_min_months: 'int',
  },
  loan_schedule_overrides: {
    ...owned,
    due_date: 'day',
    interest_amount: 'money',
    loan_id: 'uuid',
    payment_number: 'int',
    principal_amount: 'money',
    source: 'text',
    total_amount: 'money',
  },
  loans: {
    ...owned,
    annual_rate_percent: 'real',
    closed_date: 'day',
    contract_number: 'text',
    description: 'text',
    first_payment_date: 'day',
    interest_accrual: 'text',
    late_after_days: 'int',
    payment_day_of_month: 'int',
    payment_wallet_id: 'uuid',
    prepayment_mode: 'text',
    prepayment_window_days: 'int',
    principal_amount: 'money',
    schedule_type: 'text',
    start_date: 'day',
    term_months: 'int',
  },
  stat_views: {
    ...owned,
    auto_rule: 'json',
    config: 'json',
    is_active: 'bool',
    is_auto_rule_enabled: 'bool',
    name: 'text',
    scope: 'text',
    sort_order: 'int',
  },
  transactions: {
    ...owned,
    category_id: 'text',
    date: 'day',
    description: 'text',
    from_amount: 'money',
    from_wallet_id: 'uuid',
    to_amount: 'money',
    to_wallet_id: 'uuid',
    type: 'text',
  },
  user_settings: {
    ...owned,
    base_currency_code: 'text',
    is_payment_reminders_enabled: 'bool',
    locale: 'text',
    timezone: 'text',
  },
  wallets: {
    ...owned,
    color: 'text',
    credit_limit: 'money',
    currency_code: 'text',
    description: 'text',
    is_archived: 'bool',
    is_excluded_from_total: 'bool',
    is_in_forecast: 'bool',
    is_withdrawable: 'bool',
    name: 'text',
    sort_order: 'int',
    type: 'text',
  },
} as const satisfies Record<string, Record<string, ColumnKind>>

export type SyncedTableName = keyof typeof TABLE_COLUMNS

// Compile-time guard: every Postgres column but `id` is mapped, with a kind of the same type.
type Tables = Database['public']['Tables']
type Json = Tables['stat_views']['Row']['config']
type KindType<K> = K extends 'bool' ? boolean : K extends 'json' ? Json : K extends 'text' | 'uuid' ? string : number
type Pg<T extends SyncedTableName> = Omit<Tables[T]['Row'], 'id'>
type Map<T extends SyncedTableName> = typeof TABLE_COLUMNS[T]
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
type ColumnsMatch = {
  [T in SyncedTableName]: Same<keyof Map<T>, keyof Pg<T>> extends true
    ? { [C in keyof Pg<T>]: Same<NonNullable<Pg<T>[C]>, KindType<Map<T>[C & keyof Map<T>]>> }
    : { columns: Exclude<keyof Pg<T>, keyof Map<T>> | Exclude<keyof Map<T>, keyof Pg<T>> }
}
type AssertColumnsMatch = ColumnsMatch extends { [T in SyncedTableName]: Record<keyof Pg<T>, true> } ? true : never
// eslint-disable-next-line unused-imports/no-unused-vars -- exists only to fail typecheck on drift
const columnsMatch: AssertColumnsMatch = true

/** Columns sent as JSON objects on upload; SQLite keeps them as text. */
export const JSON_COLUMNS: Partial<Record<SyncedTableName, string[]>> = Object.fromEntries(
  Object.entries(TABLE_COLUMNS)
    .map(([table, columns]) => [table, Object.entries(columns).filter(([, kind]) => kind === 'json').map(([c]) => c)] as const)
    .filter(([, columns]) => columns.length),
)

const camel = (column: string) => column.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())

/**
 * SQLite row -> item: snake_case to camelCase, 0/1 to boolean, JSON text parsed. Null columns are left out, so
 * zod defaults and optional fields apply.
 */
export function rowToItem(table: SyncedTableName, row: Record<string, unknown>): Record<string, unknown> {
  const item: Record<string, unknown> = {}
  for (const [column, kind] of Object.entries(TABLE_COLUMNS[table]) as [string, ColumnKind][]) {
    const value = row[column]
    if (value == null)
      continue
    if (kind === 'bool')
      item[camel(column)] = !!value
    else if (kind === 'json')
      item[camel(column)] = typeof value === 'string' ? safeJson(value) : value
    else if (kind === 'text' || kind === 'uuid')
      item[camel(column)] = String(value)
    else
      item[camel(column)] = Number(value)
  }
  return item
}

/** Item -> SQLite row: every mapped column written (absent = null), booleans as 0/1, JSON as text. */
export function itemToRow(table: SyncedTableName, item: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  for (const [column, kind] of Object.entries(TABLE_COLUMNS[table]) as [string, ColumnKind][]) {
    const value = item[camel(column)]
    if (value == null || value === '')
      row[column] = null
    else if (kind === 'bool')
      row[column] = value ? 1 : 0
    else if (kind === 'json')
      row[column] = JSON.stringify(value)
    else if (kind === 'int' || kind === 'money' || kind === 'day' || kind === 'instant')
      row[column] = Math.round(Number(value))
    else
      row[column] = value
  }
  return row
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value)
  }
  catch {
    return null
  }
}
