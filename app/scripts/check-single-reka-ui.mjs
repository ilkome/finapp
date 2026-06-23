import { execSync } from 'node:child_process'

// reka-ui must resolve to ONE version in the app tree. Two copies make its
// createContext run twice and break provide/inject ("Injection
// Symbol(ContextMenuRootContext) not found") in the production bundle - it
// passes type-check and unit tests, only failing in the bundled app. The app
// pins reka-ui to @nuxt/ui's exact version to stay deduped; this guard fails
// loudly if a future bump (ours or @nuxt/ui's) reintroduces a second copy.

const out = execSync('pnpm --filter @finapp/app why reka-ui', { encoding: 'utf8' })
const versions = [...new Set(out.match(/reka-ui@\d+\.\d+\.\d+/g) ?? [])]

if (versions.length > 1) {
  console.error(`✗ reka-ui resolves to multiple versions: ${versions.join(', ')}`)
  console.error('  Align app/package.json "reka-ui" with @nuxt/ui\'s pinned version.')
  process.exit(1)
}

console.log(`✓ reka-ui single version: ${versions[0] ?? '(none)'}`)
