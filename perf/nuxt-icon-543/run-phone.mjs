// Runs repro.html in Chrome on an Android phone over CDP (`adb forward tcp:9222 localabstract:chrome_devtools_remote`).
// Chrome on Android cannot open a tab over CDP, so it borrows an open tab of ORIGIN, writes the page into
// about:blank and navigates back to ORIGIN afterwards.
// Usage: ORIGIN=https://... node perf/nuxt-icon-543/run-phone.mjs [runs]
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const { ORIGIN } = process.env
const runs = Number(process.argv[2] || 3)
const html = fs.readFileSync(path.join(import.meta.dirname, 'repro.html'), 'utf8')
async function main() {
  const target = (await (await fetch('http://localhost:9222/json/list')).json()).find(t => t.type === 'page' && t.url.startsWith(ORIGIN))
  if (!target)
    throw new Error(`no open tab of ${ORIGIN}`)

  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise(r => ws.addEventListener('open', r))
  let id = 0
  const pending = new Map()
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    pending.get(m.id)?.(m)
    pending.delete(m.id)
  })
  function send(method, params = {}) {
    return new Promise((r) => {
      pending.set(++id, r)
      ws.send(JSON.stringify({ id, method, params }))
    })
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms))

  for (let run = 0; run < runs; run++) {
    for (const variant of ['none', 'property', 'adopted']) {
      await send('Page.navigate', { url: 'about:blank' })
      await sleep(1500)
      const page = html.replace('<script>', `<script>window.__variant = ${JSON.stringify(variant)};`)
      await send('Runtime.evaluate', { expression: `document.open(); document.write(${JSON.stringify(page)}); document.close()` })
      let result
      for (let i = 0; i < 60 && !result; i++) {
        await sleep(1000)
        result = (await send('Runtime.evaluate', { expression: 'window.__result', returnByValue: true })).result?.result?.value
      }
      const ua = (await send('Runtime.evaluate', { expression: 'navigator.userAgent', returnByValue: true })).result?.result?.value
      console.log(JSON.stringify({ chrome: ua.match(/Chrome\/[\d.]+/)?.[0], ...result }))
    }
  }
  await send('Page.navigate', { url: `${ORIGIN}/dashboard` })
  ws.close()
}

main()
