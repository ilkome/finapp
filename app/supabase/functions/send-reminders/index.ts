// Deliver due recurrence reminders as Web Push (pg_cron, daily).
//
// Reads `push_reminders` rows whose fireDate has arrived and are not yet sent, then pushes each to
// the owner's subscribed devices and stamps `sentAt`. Reminder rows are precomputed by the client
// (which owns the occurrence engine), so this function does no date math. Requires a service_role
// bearer (cross-user batch). Dead endpoints (404/410) are pruned. Old sent rows are swept.

import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'jsr:@supabase/supabase-js@2'

function jwtRole(token: string): string | null {
  try {
    return JSON.parse(atob(token.split('.')[1])).role ?? null
  }
  catch {
    return null
  }
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@finapp.ilko.me'

const DAY_MS = 86_400_000

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method !== 'POST')
    return json({ error: 'method not allowed' }, 405)

  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  if (jwtRole(token) !== 'service_role')
    return json({ error: 'unauthorized' }, 401)

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  // Everything due through the end of the current UTC day. Reminder fireDates are UTC-midnight
  // civil days, so this covers today and any missed past days.
  const now = Date.now()
  const cutoff = Math.floor(now / DAY_MS) * DAY_MS + DAY_MS - 1

  const { data: due, error: selErr } = await supabase
    .from('push_reminders')
    .select('id, userId, title, body')
    .is('sentAt', null)
    .lte('fireDate', cutoff)
    .order('fireDate', { ascending: true })
    .limit(1000)

  if (selErr)
    return json({ error: selErr.message }, 500)

  if (!due || due.length === 0) {
    await sweepOldSent(supabase, now)
    return json({ processed: 0, sent: 0 })
  }

  // Cache subscriptions per user across their reminders.
  const subsByUser = new Map<string, { id: string, endpoint: string, p256dh: string, auth: string }[]>()
  const dead = new Set<string>()
  let sent = 0

  for (const r of due) {
    let subs = subsByUser.get(r.userId)
    if (!subs) {
      const { data } = await supabase
        .from('push_subscriptions')
        .select('id, endpoint, p256dh, auth')
        .eq('userId', r.userId)
      subs = data ?? []
      subsByUser.set(r.userId, subs)
    }

    const payload = JSON.stringify({
      title: r.title,
      body: r.body,
      url: '/recurrences',
      icon: '/pwa-192x192.png',
    })

    await Promise.all(subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload)
        sent++
      }
      catch (err) {
        const code = (err as { statusCode?: number }).statusCode
        if (code === 404 || code === 410)
          dead.add(s.id)
        else
          console.error('push send failed:', code, (err as Error).message)
      }
    }))
  }

  // Mark every due row processed (even with no subscription) so it never re-fires; the reminder is
  // time-bound - a missed one should not pile up.
  await supabase.from('push_reminders').update({ sentAt: now }).in('id', due.map(r => r.id))

  if (dead.size > 0)
    await supabase.from('push_subscriptions').delete().in('id', [...dead])

  await sweepOldSent(supabase, now)

  return json({ processed: due.length, sent, pruned: dead.size })
})

// Keep the queue small: drop reminders delivered more than 30 days ago.
async function sweepOldSent(supabase: ReturnType<typeof createClient>, now: number) {
  await supabase.from('push_reminders').delete().lt('sentAt', now - 30 * DAY_MS)
}
