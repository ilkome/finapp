// Send a Web Push notification to a user's subscribed devices.
//
// Auth: a service_role JWT may target any { userId }; a user JWT may only
// target itself (the body userId is ignored). Dead endpoints (404/410) are
// pruned. See docs reference for the full design.

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

  let payload: { userId?: string, title?: string, body?: string, url?: string, icon?: string }
  try {
    payload = await req.json()
  }
  catch {
    return json({ error: 'invalid json body' }, 400)
  }

  if (!payload.title)
    return json({ error: 'title is required' }, 400)

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  // Resolve the target user. service_role can target anyone; a user JWT is
  // pinned to its own id regardless of the body.
  let targetUserId: string | undefined
  if (jwtRole(token) === 'service_role') {
    targetUserId = payload.userId
  }
  else {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user)
      return json({ error: 'unauthorized' }, 401)
    targetUserId = data.user.id
  }

  if (!targetUserId)
    return json({ error: 'userId is required' }, 400)

  const { data: subs, error: selErr } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('userId', targetUserId)

  if (selErr)
    return json({ error: selErr.message }, 500)

  if (!subs || subs.length === 0)
    return json({ sent: 0, pruned: 0, note: 'no subscriptions' })

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body ?? '',
    url: payload.url ?? '/dashboard',
    icon: payload.icon ?? '/pwa-192x192.png',
  })

  let sent = 0
  const dead: string[] = []

  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        body,
      )
      sent++
    }
    catch (err) {
      const code = (err as { statusCode?: number }).statusCode
      if (code === 404 || code === 410)
        dead.push(s.id)
      else
        console.error('push send failed:', code, (err as Error).message)
    }
  }))

  if (dead.length > 0)
    await supabase.from('push_subscriptions').delete().in('id', dead)

  return json({ sent, pruned: dead.length, total: subs.length })
})
