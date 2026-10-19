// Hourly: send Web Push reminders about credit-card and loan payments through `send-push`.
//
// Service-role callers only (the function reads every user's data). `?dryRun=1` lists what a run
// would send, as of each user's local day, without sending or recording anything. Selection lives
// in the app's `loans/paymentReminders.ts`; see the docs reference for the rules.

/// <reference path="./import-meta.d.ts" />

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { rowToBankReport, rowToLoan, rowToLoanScheduleOverride, rowToTrn, rowToWallet } from '~~/services/powersync/transforms.ts'

import type { LocaleSlug } from '~/components/locale/types.ts'
import type { UserReminderInput } from '~/components/loans/paymentReminders.ts'

import { isReminderHour, planUserPushes, reminderKeyId } from '~/components/loans/paymentReminders.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const PAGE = 1000
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' }, status })

/** Constant-time compare, so the response time does not leak how much of the key matched. */
function isServiceKey(token: string): boolean {
  const a = new TextEncoder().encode(token)
  const b = new TextEncoder().encode(SERVICE_ROLE_KEY)
  let diff = a.length ^ b.length
  for (let i = 0; i < b.length; i++)
    diff |= (a[i] ?? 0) ^ b[i]
  return diff === 0
}

// deno-lint-ignore no-explicit-any
type Row = Record<string, any> & { id: string }

/** All rows of a query; PostgREST caps one response at `max_rows`. */
// deno-lint-ignore no-explicit-any
async function fetchAll(query: (from: number, to: number) => PromiseLike<{ data: any[] | null, error: { message: string } | null }>): Promise<Row[]> {
  const rows: Row[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await query(from, from + PAGE - 1)
    if (error)
      throw new Error(error.message)
    rows.push(...data!)
    if (data!.length < PAGE)
      return rows
  }
}

const byId = <T>(rows: Row[], map: (row: Row) => T | null) =>
  Object.fromEntries(rows.flatMap((row) => {
    const item = map(row)
    return item ? [[row.id, item]] : []
  }))

async function loadUser(userId: string, settings: Row): Promise<UserReminderInput | null> {
  const wallets = await fetchAll((from, to) => supabase.from('wallets').select('*').eq('user_id', userId).in('type', ['credit_card', 'loan']).range(from, to))
  if (wallets.length === 0)
    return null

  const creditIds = new Set<string>(wallets.map(w => w.id))
  const ids = [...creditIds].join(',')
  // Every wallet a transfer touches is needed for balances, so the counterparties come along.
  const trns = await fetchAll((from, to) => supabase.from('transactions').select('*').eq('user_id', userId).or(`from_wallet_id.in.(${ids}),to_wallet_id.in.(${ids})`).range(from, to))
  const otherIds = new Set(trns.flatMap(t => [t.from_wallet_id, t.to_wallet_id]).filter((id): id is string => !!id && !creditIds.has(id)))
  const others = otherIds.size === 0
    ? []
    : await fetchAll((from, to) => supabase.from('wallets').select('*').eq('user_id', userId).in('id', [...otherIds]).range(from, to))
  const loans = await fetchAll((from, to) => supabase.from('loans').select('*').eq('user_id', userId).range(from, to))
  const scheduleOverrides = await fetchAll((from, to) => supabase.from('loan_schedule_overrides').select('*').eq('user_id', userId).range(from, to))
  const bankReports = await fetchAll((from, to) => supabase.from('bank_reports').select('*').eq('user_id', userId).in('id', [...creditIds]).range(from, to))
  const currencies = await fetchAll((from, to) => supabase.from('currencies').select('*').eq('user_id', userId).range(from, to))

  return {
    bankReports: byId(bankReports, rowToBankReport),
    currencies: Object.fromEntries(currencies.map(row => [row.code, {
      minorDisplay: row.minor_display ?? undefined,
      scale: row.scale ?? undefined,
      symbol: row.symbol ?? undefined,
    }])),
    loans: byId(loans, rowToLoan),
    locale: (settings.locale as LocaleSlug | null) ?? null,
    scheduleOverrides: byId(scheduleOverrides, rowToLoanScheduleOverride),
    timezone: settings.timezone ?? null,
    trns: byId(trns, rowToTrn),
    wallets: byId([...wallets, ...others], rowToWallet),
  }
}

async function sendPush(userId: string, title: string, body: string): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
    body: JSON.stringify({ body, title, url: '/loans', userId }),
    headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
    method: 'POST',
  })
  if (!res.ok)
    return false
  // Zero delivered (no subscriptions, or every endpoint failed) is not a send: retry on the next run.
  const result = await res.json().catch(() => ({})) as { sent?: number }
  return (result.sent ?? 0) > 0
}

Deno.serve(async (req) => {
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  if (!isServiceKey(token))
    return json({ error: 'service role required' }, 403)

  const dryRun = new URL(req.url).searchParams.get('dryRun') === '1'
  const now = Date.now()
  const report: { body: string, kinds: string[], title: string, userId: string, walletId: string }[] = []
  const failures: string[] = []

  try {
    const users = await fetchAll((from, to) => supabase.from('user_settings').select('*').eq('is_payment_reminders_enabled', true).range(from, to))

    for (const settings of users) {
      const userId = settings.user_id as string
      if (!dryRun && !isReminderHour(now, settings.timezone ?? null))
        continue
      try {
        const input = await loadUser(userId, settings)
        if (!input)
          continue

        const sentRows = await fetchAll((from, to) => supabase.from('payment_reminder_deliveries').select('wallet_id, kind, due_date').eq('user_id', userId).range(from, to))
        const sent = new Set(sentRows.map(r => reminderKeyId({ dueDate: Number(r.due_date), kind: r.kind, walletId: r.wallet_id })))

        for (const push of planUserPushes(input, now, sent, { ignoreHour: dryRun }) ?? []) {
          report.push({ body: push.body, kinds: push.keys.map(k => k.kind), title: push.title, userId, walletId: push.walletId })
          if (dryRun)
            continue
          if (!await sendPush(userId, push.title, push.body)) {
            failures.push(`${userId}:${push.walletId}`)
            continue
          }
          const { error } = await supabase.from('payment_reminder_deliveries').upsert(
            push.keys.map(k => ({ due_date: k.dueDate, kind: k.kind, sent_at: now, user_id: userId, wallet_id: k.walletId })),
            { ignoreDuplicates: true, onConflict: 'user_id,wallet_id,kind,due_date' },
          )
          if (error)
            console.error('record sent failed:', userId, error.message)
        }
      }
      catch (err) {
        console.error('user failed:', userId, (err as Error).message)
        failures.push(userId)
      }
    }
  }
  catch (err) {
    return json({ error: (err as Error).message }, 500)
  }

  return json(dryRun ? { dryRun: true, pushes: report } : { failed: failures, pushes: report.length })
})
