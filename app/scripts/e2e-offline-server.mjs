// Local harness for tests/e2e/offline-sync.spec.ts: builds the production bundle against a
// toggleable TCP proxy, then serves that build and the proxy from one process.
//   GET :8199/off  -> new connections refused, open ones killed (real network loss)
//   GET :8199/hang -> connections accepted, never answered (very slow network)
//   GET :8199/on   -> pass-through
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import http from 'node:http'
import net from 'node:net'
import process from 'node:process'

const root = new URL('../', import.meta.url)
const PORT = { app: 3080, control: 8199, powersync: 8098, supabase: 54399 }
const UPSTREAM = { powersync: 8080, supabase: 54321 }

// The bundle bakes the backend URLs in at build time, so it has to point at the proxy ports.
const envE2e = readFileSync(new URL('.env.local', root), 'utf8')
  .replace(/:54321\b/g, `:${PORT.supabase}`)
  .replace(/:8080\b/g, `:${PORT.powersync}`)
writeFileSync(new URL('.env.e2e', root), envE2e)

const marker = new URL('.output/public/.e2e-proxy', root)
if (!existsSync(marker) || process.env.E2E_BUILD) {
  execSync('pnpm nuxt generate --dotenv .env.e2e', { cwd: root, stdio: 'inherit' })
  writeFileSync(marker, '')
}

let online = true
let hang = false
const sockets = new Set()

function proxy(listen, target) {
  net.createServer((client) => {
    if (!online)
      return client.destroy()
    sockets.add(client)
    client.on('error', () => {})
    if (hang)
      return
    const upstream = net.connect(target, '127.0.0.1')
    sockets.add(upstream)
    client.pipe(upstream)
    upstream.pipe(client)
    const end = () => {
      client.destroy()
      upstream.destroy()
      sockets.delete(client)
      sockets.delete(upstream)
    }
    upstream.on('error', end)
    client.on('close', end)
    upstream.on('close', end)
  }).listen(listen, '127.0.0.1')
}

function dropAll() {
  for (const socket of sockets)
    socket.destroy()
  sockets.clear()
}

proxy(PORT.supabase, UPSTREAM.supabase)
proxy(PORT.powersync, UPSTREAM.powersync)

http.createServer((req, res) => {
  if (req.url === '/off') {
    online = false
    hang = false
    dropAll()
  }
  else if (req.url === '/hang') {
    online = true
    hang = true
    dropAll()
  }
  else if (req.url === '/on') {
    online = true
    hang = false
  }
  res.end(JSON.stringify({ hang, online }))
}).listen(PORT.control, '127.0.0.1')

process.env.PORT = String(PORT.app)
await import('./serve-static.mjs')
console.log(`proxy up: ${PORT.supabase}->${UPSTREAM.supabase}, ${PORT.powersync}->${UPSTREAM.powersync}, control :${PORT.control}`)
