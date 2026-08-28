import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'

const storage = vi.hoisted(() => new Map<string, unknown>())

vi.mock('@vueuse/core', () => ({
  useStorage: (key: string, defaultValue: unknown) => {
    if (!storage.has(key))
      storage.set(key, ref(structuredClone(defaultValue)))
    return storage.get(key)
  },
}))

vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)

const { useCategoriesExpanded } = await import('./useCategoriesExpanded')

beforeEach(() => storage.clear())

describe('useCategoriesExpanded persistent default', () => {
  it('applies the selected default to categories appearing in a new period', () => {
    const ids = ref(['food'])
    const expanded = useCategoriesExpanded('stats', computed(() => ids.value), { persistDefault: true })

    expect(expanded.isExpanded('food')).toBe(false)
    expanded.toggleAll()
    ids.value = ['food', 'travel']

    expect(expanded.isExpanded('food')).toBe(true)
    expect(expanded.isExpanded('travel')).toBe(true)
  })

  it('keeps a manual exception when categories disappear and return', () => {
    const ids = ref(['food', 'travel'])
    const expanded = useCategoriesExpanded('stats', computed(() => ids.value), { persistDefault: true })

    expanded.toggleAll()
    expanded.toggle('travel')
    ids.value = ['food']
    ids.value = ['food', 'travel']

    expect(expanded.isExpanded('food')).toBe(true)
    expect(expanded.isExpanded('travel')).toBe(false)
  })

  it('keeps a manually expanded category in collapsed mode', () => {
    const ids = ref(['food'])
    const expanded = useCategoriesExpanded('stats', computed(() => ids.value), { persistDefault: true })

    expanded.toggle('food')
    ids.value = []
    ids.value = ['food']

    expect(expanded.isExpanded('food')).toBe(true)
  })

  it('clears manual exceptions when toggling all categories', () => {
    const ids = ref(['food', 'travel'])
    const expanded = useCategoriesExpanded('stats', computed(() => ids.value), { persistDefault: true })

    expanded.toggle('food')
    expanded.toggleAll()

    expect(expanded.isExpanded('food')).toBe(true)
    expect(expanded.isExpanded('travel')).toBe(true)

    expanded.toggleAll()

    expect(expanded.isExpanded('food')).toBe(false)
    expect(expanded.isExpanded('travel')).toBe(false)
  })

  it('resets the expanded state', () => {
    const ids = ref(['food', 'travel'])
    const expanded = useCategoriesExpanded('stats', computed(() => ids.value), { persistDefault: true })

    expanded.toggleAll()
    expanded.toggle('travel')
    expanded.reset()

    expect(expanded.isExpanded('food')).toBe(false)
    expect(expanded.isExpanded('travel')).toBe(false)
  })
})
