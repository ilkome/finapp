import { readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// Minimal SPA static server for the production build (`.output/public`),
// mirroring Vercel's static hosting + index.html rewrite for the prod e2e run.

const root = fileURLToPath(new URL('../.output/public/', import.meta.url))
const port = Number(process.env.PORT) || 3050

const types = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
}

async function send(res, path) {
  const body = await readFile(path)
  res.setHeader('content-type', types[extname(path)] ?? 'application/octet-stream')
  res.end(body)
}

createServer(async (req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0])
  const filePath = normalize(join(root, url))
  if (filePath.startsWith(root)) {
    try {
      if ((await stat(filePath)).isFile())
        return await send(res, filePath)
    }
    catch {}
  }
  await send(res, join(root, 'index.html'))
}).listen(port, () => console.log(`static server on http://localhost:${port}`))
