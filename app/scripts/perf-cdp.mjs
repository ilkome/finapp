/**
 * Before/after speed checks against a running Finapp page over the Chrome DevTools protocol, so
 * numbers are comparable between runs and builds. Works with the Android PWA
 * (`adb forward tcp:9222 localabstract:chrome_devtools_remote`) or any Chrome started with
 * `--remote-debugging-port=9222`. The page must be signed in (real mode) and open on the screen
 * to measure, usually /dashboard.
 *
 *   node scripts/perf-cdp.mjs edit [--runs 10] [--trn <id>] [--visit] [--profile out.json]
 *     Edits one transaction's amount and puts it back, alternating, and times each `saveTrn`
 *     until the Vue flush is done (main-thread cost of one edit). The value is always restored.
 *     --visit first walks the kept-alive pages (wallets, 3 wallet pages, categories, 2 category
 *     pages, history) and returns to /dashboard, so hidden cached pages are part of the cost.
 *   node scripts/perf-cdp.mjs boot [--runs 3] [--wait 12]
 *     Reloads the page and reads first paint plus the `ps:watch:*` first-emission measures.
 *
 * Prints one JSON line: build version, trn count, per-run values and median/p90.
 */
import { writeFileSync } from 'node:fs'
import process from 'node:process'
import { parseArgs } from 'node:util'

const { positionals, values: opts } = parseArgs({
  allowPositionals: true,
  options: {
    port: { default: '9222', type: 'string' },
    profile: { type: 'string' },
    runs: { type: 'string' },
    trn: { type: 'string' },
    visit: { default: false, type: 'boolean' },
    wait: { default: '12', type: 'string' },
  },
})
const mode = positionals[0]
if (mode !== 'edit' && mode !== 'boot') {
  console.error('usage: node scripts/perf-cdp.mjs edit|boot [options]')
  process.exit(1)
}

const base = `http://localhost:${opts.port}`
const sleep = ms => new Promise(r => setTimeout(r, ms))
function stats(xs) {
  const s = [...xs].sort((a, b) => a - b)
  return { max: s.at(-1), median: s[Math.floor(s.length / 2)], min: s[0], p90: s[Math.min(s.length - 1, Math.floor(s.length * 0.9))] }
}

async function connect() {
  const targets = await (await fetch(`${base}/json/list`)).json()
  const target = targets.find(t => t.type === 'page' && /finapp|localhost/.test(t.url))
  if (!target)
    throw new Error('no Finapp page among the DevTools targets')
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })
  let id = 0
  const pending = new Map()
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    pending.get(m.id)?.(m)
    pending.delete(m.id)
  }
  const send = (method, params = {}) => new Promise((resolve) => {
    const i = ++id
    pending.set(i, resolve)
    ws.send(JSON.stringify({ id: i, method, params }))
  })
  const evaluate = async (body) => {
    const res = await send('Runtime.evaluate', { awaitPromise: true, expression: `(async () => { ${body} })()`, returnByValue: true })
    if (res.result?.exceptionDetails)
      throw new Error(res.result.exceptionDetails.exception?.description ?? 'evaluate failed')
    return res.result?.result?.value
  }
  return { close: () => ws.close(), evaluate, send }
}

const STORE = `document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$pinia._s`
const VERSION = `
  const urls = [...new Set(performance.getEntriesByType('resource').map(e => e.name).filter(n => n.includes('/_nuxt/') && n.endsWith('.js')))]
  for (const u of urls) { const m = (await fetch(u).then(r => r.text())).match(/\\d+\\.\\d+\\.\\d+-beta\\.\\d+/); if (m) return m[0] }
  return null`

async function editBench(cdp) {
  const runs = Number(opts.runs ?? 10)
  const info = await cdp.evaluate(`
    const trns = ${STORE}.get('trns')
    const items = trns.items ?? {}
    const id = ${JSON.stringify(opts.trn ?? null)} ?? Object.entries(items)
      .filter(([, t]) => t.type === 0 && t.categoryId !== 'adjustment')
      .sort((a, b) => b[1].date - a[1].date)[0]?.[0]
    return { amount: items[id]?.amount, count: Object.keys(items).length, id, path: location.pathname }`)
  if (info.amount === undefined)
    throw new Error('no transaction to edit')
  const edit = amount => cdp.evaluate(`
    const tick = () => new Promise(r => { const c = new MessageChannel(); c.port1.onmessage = r; c.port2.postMessage(0) })
    const trns = ${STORE}.get('trns')
    const trn = trns.items['${info.id}']
    const t0 = performance.now()
    trns.saveTrn({ id: '${info.id}', values: { ...trn, amount: ${amount} } })
    await tick()
    return performance.now() - t0`)

  if (opts.visit) {
    await cdp.evaluate(`
      const app = document.querySelector('#__nuxt').__vue_app__.config.globalProperties
      const wallets = Object.keys(app.$pinia._s.get('wallets').items ?? {}).slice(0, 3)
      const categories = Object.keys(app.$pinia._s.get('categories').items ?? {})
        .filter(id => id !== 'transfer' && id !== 'adjustment').slice(0, 2)
      const paths = ['/wallets', ...wallets.map(id => '/wallets/' + id), '/categories',
        ...categories.map(id => '/categories/' + id), '/history', '/dashboard']
      for (const path of paths) {
        await app.$router.push(path)
        await new Promise(r => setTimeout(r, 1500))
      }
      return true`)
  }

  // Warm-up pair: the first edit after load pays one-off costs (lazy chunks, JIT).
  await edit(info.amount + 1)
  await sleep(1500)
  await edit(info.amount)
  await sleep(1500)

  if (opts.profile) {
    await cdp.send('Profiler.enable')
    await cdp.send('Profiler.setSamplingInterval', { interval: 250 })
    await cdp.send('Profiler.start')
  }
  const times = []
  try {
    for (let i = 0; i < runs; i++) {
      times.push(Math.round(await edit(i % 2 ? info.amount : info.amount + 1)))
      await sleep(1500)
    }
  }
  finally {
    await edit(info.amount)
  }
  if (opts.profile) {
    const { result } = await cdp.send('Profiler.stop')
    writeFileSync(opts.profile, JSON.stringify(result.profile))
  }
  return { count: info.count, id: info.id, ms: stats(times), path: info.path, times, visited: opts.visit }
}

async function bootBench(cdp) {
  const runs = Number(opts.runs ?? 3)
  const results = []
  for (let i = 0; i < runs; i++) {
    await cdp.evaluate('location.reload(); return true').catch(() => {})
    await sleep(Number(opts.wait) * 1000)
    results.push(await cdp.evaluate(`
      const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime
      const watch = Object.fromEntries(performance.getEntriesByType('measure')
        .filter(m => m.name.startsWith('ps:watch:'))
        .map(m => [m.name.slice(9).split(' ')[0], Math.round(m.duration)]))
      return { fcp: Math.round(fcp ?? -1), watch }`))
  }
  const keys = Object.keys(results[0].watch)
  return {
    fcp: stats(results.map(r => r.fcp)),
    runs: results,
    watch: Object.fromEntries(keys.map(k => [k, stats(results.map(r => r.watch[k]).filter(v => v != null)).median])),
  }
}

const cdp = await connect()
try {
  const version = await cdp.evaluate(VERSION)
  const result = mode === 'edit' ? await editBench(cdp) : await bootBench(cdp)
  console.log(JSON.stringify({ at: new Date().toISOString(), mode, version, ...result }))
}
finally {
  cdp.close()
}
