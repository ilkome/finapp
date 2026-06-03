/**
 * Shared setup for Pinia store tests.
 *
 * Runs before each store test file (vitest setupFile).
 * Stubs Nuxt/Vue/VueUse auto-imports, mocks common modules,
 * and exports shared state for assertions.
 *
 * Entity-specific mocks (cross-store deps) stay inline in each test file.
 */
import { defineStore } from 'pinia'
import { vi } from 'vitest'
import { computed, reactive, ref, shallowRef, toRaw, watch } from 'vue'

vi.stubGlobal('computed', computed)
vi.stubGlobal('reactive', reactive)
vi.stubGlobal('ref', ref)
vi.stubGlobal('shallowRef', shallowRef)
vi.stubGlobal('toRaw', toRaw)
vi.stubGlobal('watch', watch)
vi.stubGlobal('defineStore', defineStore)

vi.stubGlobal('useDebounceFn', (fn: (...args: any[]) => any) => fn)
vi.stubGlobal('perf', () => {})

export const toastAddMock = vi.fn()

vi.stubGlobal('useToast', () => ({ add: toastAddMock }))
vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))
vi.stubGlobal('useNuxtApp', () => ({ $i18n: { t: (key: string) => key } }))
vi.stubGlobal('tryUseNuxtApp', () => ({ $i18n: { t: (key: string) => key } }))

vi.mock('~/components/demo/useDemo', () => ({
  useDemo: () => ({ isDemo: { value: false } }),
}))

vi.mock('~/assets/js/emo', () => ({
  errorEmo: [':('],
  random: (items: any[]) => items[0],
  successEmo: [':)'],
  warningEmo: [':/'],
}))
