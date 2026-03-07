/**
 * Shared setup for Pinia store tests.
 *
 * Runs before each store test file (vitest setupFile).
 * Stubs Nuxt/Vue/VueUse auto-imports, mocks common modules,
 * and exports shared state for assertions.
 *
 * Entity-specific mocks (Convex routes, cross-store deps) stay inline in each test file.
 */
import { vi } from 'vitest'

// ---------------------------------------------------------------------------
// 1. Vue / Pinia auto-imports
// ---------------------------------------------------------------------------
const { computed, ref, shallowRef, watch } = await import('vue')
const { defineStore } = await import('pinia')

vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)
vi.stubGlobal('shallowRef', shallowRef)
vi.stubGlobal('watch', watch)
vi.stubGlobal('defineStore', defineStore)

// ---------------------------------------------------------------------------
// 2. VueUse auto-imports — synchronous for test predictability
// ---------------------------------------------------------------------------
vi.stubGlobal('useDebounceFn', (fn: (...args: any[]) => any) => fn)

// ---------------------------------------------------------------------------
// 3. Nuxt auto-imports
// ---------------------------------------------------------------------------
export const toastAddMock = vi.fn()

vi.stubGlobal('useToast', () => ({ add: toastAddMock }))
vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))
vi.stubGlobal('useNuxtApp', () => ({ $i18n: { t: (key: string) => key } }))
vi.stubGlobal('tryUseNuxtApp', () => ({ $i18n: { t: (key: string) => key } }))

// ---------------------------------------------------------------------------
// 4. Project auto-imports (utils/)
// ---------------------------------------------------------------------------
vi.stubGlobal('asConvexId', (id: string) => id)
vi.stubGlobal('isLocalId', (id: string) => id.startsWith('local_'))
vi.stubGlobal('cleanupFrontendIds', <T>(data: Record<string, T>, pendingUpdates: Record<string, T>) => {
  const result = { ...data }
  for (const id of Object.keys(result)) {
    if (id.startsWith('local_') && !pendingUpdates[id])
      delete result[id]
  }
  return result
})

// ---------------------------------------------------------------------------
// 5. Common module mocks
// ---------------------------------------------------------------------------
vi.mock('vue-deepunref', () => ({ deepUnref: (v: any) => v }))

vi.mock('~/components/demo/useDemo', () => ({
  useDemo: () => ({ isDemo: { value: false } }),
}))

vi.mock('~/components/offline/replay', () => ({
  isReplaying: () => false,
}))

vi.mock('~/assets/js/emo', () => ({
  errorEmo: [':('],
  random: (items: any[]) => items[0],
  successEmo: [':)'],
  warningEmo: [':/'],
}))
