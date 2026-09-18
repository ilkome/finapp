// Loads every story in a running Storybook and fails on a render error, an empty canvas, or a
// tag Vue left unresolved (a component the resolver in .storybook/main.ts could not map).
import { chromium } from '@playwright/test'
import process from 'node:process'

const base = process.env.STORYBOOK_URL ?? 'http://localhost:6006'
const index = await fetch(`${base}/index.json`).then(res => res.json())
const ids = Object.values(index.entries).filter(entry => entry.type === 'story').map(entry => entry.id)

const browser = await chromium.launch()
const page = await browser.newPage()
const bad = []

for (const id of ids) {
  const errors = new Set()
  const onPageError = error => errors.add(error.message.split('\n')[0])
  const onConsole = (message) => {
    if (message.type() === 'error')
      errors.add(message.text().split('\n')[0])
  }
  page.on('pageerror', onPageError)
  page.on('console', onConsole)
  await page.goto(`${base}/iframe.html?viewMode=story&id=${id}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1200)
  const { html, unresolved } = await page.evaluate(() => {
    const root = document.getElementById('storybook-root')
    const tags = [...root.querySelectorAll('*')].map(el => el.tagName.toLowerCase())
    const unresolved = [...new Set(tags)].filter(tag =>
      !tag.includes('-')
      && tag !== 'svg'
      && !root.querySelector(`svg ${tag}`)
      && document.createElement(tag).constructor.name.startsWith('HTMLUnknown'))
    return { html: root.innerHTML.length, unresolved }
  })
  page.off('pageerror', onPageError)
  page.off('console', onConsole)
  if (errors.size || html < 10 || unresolved.length)
    bad.push({ errors: [...errors].slice(0, 3), html, id, unresolved })
}

await browser.close()
console.log(`${ids.length} stories, ${bad.length} failing`)
for (const entry of bad)
  console.log(JSON.stringify(entry))
process.exit(bad.length ? 1 : 0)
