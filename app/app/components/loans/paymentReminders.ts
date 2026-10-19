import type { MinorDisplay } from '~~/utils/money/scale'

import { addCivilDays } from '~~/utils/date/civil'
import { currencyScale, formatMinor } from '~~/utils/money/scale'

import type { BankReports } from '~/components/bankReports/types'
import type { LoanItem, Loans, LoanScheduleOverrides } from '~/components/loans/types'
import type { LocaleSlug } from '~/components/locale/types'
import type { TrnId, TrnItem } from '~/components/trns/types'
import type { WalletId, WalletItem, Wallets } from '~/components/wallets/types'

import { getWalletsTotals } from '~/components/amount/getTotal'
import { currencies as builtInCurrencies } from '~/components/currencies/currencies'
import { deriveLoan, overridesByLoan } from '~/components/loans/engine/derive'
import { collectCreditTrns } from '~/components/loans/engine/ledger'
import { deriveUpcoming } from '~/components/loans/engine/upcoming'
import { graceOf, minPaymentOf } from '~/components/loans/minPayment'
import { isCreditProduct } from '~/components/wallets/types'

/** How many civil days before the due day every reminder goes out. */
export const REMINDER_DAYS_BEFORE = 3
/** Local hour at which a user's reminders are processed. */
const REMINDER_HOUR = 10
const DEFAULT_TIMEZONE = 'Europe/Moscow'

type ReminderKind = 'grace' | 'graceMissed' | 'loan' | 'minPayment'
const KIND_ORDER: ReminderKind[] = ['loan', 'minPayment', 'grace', 'graceMissed']

export type ReminderKey = { dueDate: number, kind: ReminderKind, walletId: WalletId }

/** The user's `currencies` row for a code: a custom currency or their edit of a built-in one. */
export type ReminderCurrency = { minorDisplay?: MinorDisplay, scale?: number, symbol?: string }

export type UserReminderInput = {
  bankReports: BankReports
  /** By currency code; a code without a row formats with the built-in defaults. */
  currencies?: Record<string, ReminderCurrency>
  loans: Loans
  locale: LocaleSlug | null
  scheduleOverrides: LoanScheduleOverrides
  timezone: string | null
  /** Everything the user's credit products touch, transfers in and out included. */
  trns: Record<TrnId, TrnItem>
  wallets: Wallets
}

export type ReminderPush = {
  body: string
  /** One entry per kind merged into this push; recorded as sent once it is delivered. */
  keys: ReminderKey[]
  title: string
  walletId: WalletId
}

type Reminder = ReminderKey & { amount: number }

export const reminderKeyId = ({ dueDate, kind, walletId }: ReminderKey) => `${walletId}|${kind}|${dueDate}`

/** Local hour and civil day of an instant in `timezone` (an unknown zone falls back to the default). */
export function localClock(now: number, timezone: string | null): { hour: number, today: number } {
  function parts(zone: string) {
    const found = new Intl.DateTimeFormat('en-US', { day: 'numeric', hour: 'numeric', hourCycle: 'h23', month: 'numeric', timeZone: zone, year: 'numeric' }).formatToParts(now)
    return Object.fromEntries(found.map(part => [part.type, Number(part.value)])) as Record<'day' | 'hour' | 'month' | 'year', number>
  }
  let p: ReturnType<typeof parts>
  try {
    p = parts(timezone ?? DEFAULT_TIMEZONE)
  }
  catch {
    p = parts(DEFAULT_TIMEZONE)
  }
  return { hour: p.hour, today: Date.UTC(p.year, p.month - 1, p.day) }
}

/** Whether `now` is the user's reminder hour, so a run can skip loading their data otherwise. */
export const isReminderHour = (now: number, timezone: string | null) => localClock(now, timezone).hour === REMINDER_HOUR

/** Reminders that are due on civil day `today`, one per kind and due day. */
function dueReminders(input: UserReminderInput, today: number): Reminder[] {
  const until = addCivilDays(today, REMINDER_DAYS_BEFORE)
  const inWindow = (date: number) => date >= today && date <= until

  const creditIds = new Set(Object.entries(input.wallets).filter(([, wallet]) => isCreditProduct(wallet.type)).map(([id]) => id))
  const trnsByWallet = collectCreditTrns(input.trns, creditIds)
  const totals = getWalletsTotals({ trnsItems: input.trns, walletsItems: input.wallets })
  const overrides = overridesByLoan(input.scheduleOverrides)
  const isActive = (walletId: WalletId) => creditIds.has(walletId) && !input.wallets[walletId]!.isArchived

  const loanIds = new Set<WalletId>()
  const loans = Object.entries(input.loans).filter(([, loan]) => isActive(loan.walletId)).map(([loanId, loan]) => {
    loanIds.add(loan.walletId)
    const wallet = input.wallets[loan.walletId]!
    const summary = deriveLoan(loan, overrides.get(loanId) ?? [], trnsByWallet.get(loan.walletId) ?? [], totals.get(loan.walletId) ?? 0, today, input.bankReports[loan.walletId])
    return { currency: wallet.currencyCode, loan: loan as LoanItem, summary, walletId: loan.walletId }
  })

  const result: Reminder[] = deriveUpcoming(loans, [], today)
    .filter(item => inWindow(item.date))
    .map(item => ({ amount: item.amount, dueDate: item.date, kind: 'loan', walletId: item.walletId }))

  for (const [walletId, wallet] of Object.entries(input.wallets)) {
    if (wallet.type !== 'credit_card' || !isActive(walletId) || loanIds.has(walletId))
      continue
    const trns = trnsByWallet.get(walletId) ?? []

    const min = minPaymentOf(wallet, input.bankReports[walletId], trns, today)
    if (min?.status === 'due' && inWindow(min.date))
      result.push({ amount: min.amount, dueDate: min.date, kind: 'minPayment', walletId })

    // 'stale' and 'paid' (a zero statement debt included) never reach a reminder.
    const grace = graceOf(wallet, input.bankReports[walletId], trns, today)
    if (grace?.date == null)
      continue
    if (grace.status === 'due' && inWindow(grace.date))
      result.push({ amount: grace.amount, dueDate: grace.date, kind: 'grace', walletId })
    else if (grace.status === 'overdue')
      result.push({ amount: grace.amount, dueDate: grace.date, kind: 'graceMissed', walletId })
  }

  return result
}

const builtInSymbols = new Map(builtInCurrencies.flatMap(c => c.symbol ? [[c.code, c.symbol] as const] : []))

/** Minor units the way the app shows them: the user's display mode and symbol, else the built-in symbol, else the code. */
function formatMoney(minor: number, code: string, locale: LocaleSlug, currencies: Record<string, ReminderCurrency>): string {
  const row = currencies[code]
  let scale = 2
  try {
    scale = currencyScale(code, row?.scale === undefined ? undefined : { [code]: row.scale })
  }
  catch {}
  return formatMinor(minor, scale, { locale, minorDisplay: row?.minorDisplay ?? 'auto', symbol: row?.symbol || builtInSymbols.get(code) || code })
}

const formatDay = (date: number) => `${String(new Date(date).getUTCDate()).padStart(2, '0')}.${String(new Date(date).getUTCMonth() + 1).padStart(2, '0')}`

const LINES: Record<LocaleSlug, Record<ReminderKind, (amount: string, day: string) => string>> = {
  en: {
    grace: amount => `interest-free ${amount}`,
    graceMissed: (amount, day) => `interest-free period ended ${day}, ${amount} unpaid`,
    loan: amount => `payment ${amount}`,
    minPayment: amount => `minimum ${amount}`,
  },
  ru: {
    grace: amount => `без процентов ${amount}`,
    graceMissed: (amount, day) => `льготный период закончился ${day}, не погашено ${amount}`,
    loan: amount => `платёж ${amount}`,
    minPayment: amount => `минимум ${amount}`,
  },
}

/** Pushes to send to one user at `now`; `null` when it is not their reminder hour. `sent` holds `reminderKeyId`s. */
export function planUserPushes(
  input: UserReminderInput,
  now: number,
  sent: ReadonlySet<string>,
  { ignoreHour = false }: { ignoreHour?: boolean } = {},
): ReminderPush[] | null {
  if (!ignoreHour && !isReminderHour(now, input.timezone))
    return null
  const { today } = localClock(now, input.timezone)

  const locale = input.locale ?? 'en'
  const groups = new Map<string, Reminder[]>()
  for (const reminder of dueReminders(input, today)) {
    if (sent.has(reminderKeyId(reminder)))
      continue
    const id = `${reminder.walletId}|${reminder.dueDate}`
    groups.set(id, [...groups.get(id) ?? [], reminder])
  }

  return [...groups.values()].map((reminders) => {
    reminders.sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind))
    const { dueDate, walletId } = reminders[0]!
    const wallet = input.wallets[walletId] as WalletItem
    const day = formatDay(dueDate)
    const lines = reminders.map(r => LINES[locale][r.kind](formatMoney(r.amount, wallet.currencyCode, locale, input.currencies ?? {}), day))
    const prefix = reminders[0]!.kind === 'graceMissed' ? '' : `${locale === 'ru' ? 'до' : 'by'} ${day}: `
    return {
      body: prefix + lines.join(', '),
      keys: reminders.map(({ dueDate, kind, walletId }) => ({ dueDate, kind, walletId })),
      title: wallet.name,
      walletId,
    }
  })
}
