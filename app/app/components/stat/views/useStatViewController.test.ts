import { describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref, shallowRef, watch } from 'vue'

import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { StatView, StatViewContext } from '~/components/stat/views/types'

import { defaultConfig } from '~/components/stat/config/schema'
import { useStatViewController } from '~/components/stat/views/useStatViewController'

const h = vi.hoisted(() => ({
  store: null as any,
}))

vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)
vi.stubGlobal('watch', watch)
vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))

vi.mock('@vueuse/core', () => ({
  useStorage: (_key: string, value: unknown) => ref(value),
}))

vi.mock('~~/services/powersync/db', () => ({
  waitForFirstSync: vi.fn(),
}))

vi.mock('~/components/stat/views/useStatViewsStore', () => ({
  useStatViewsStore: () => h.store,
}))

function makeContext(pageCategoryId: string | null = null): StatViewContext {
  return {
    categoryCount: 0,
    categoryPathById: {},
    contentWidth: null,
    pageCategoryId,
    pageWalletId: null,
    parentCategoryCount: 0,
    range: { end: 1, start: 0 },
    selectedCategoryIds: [],
    selectedWalletIds: [],
  }
}

function makeView(config: MiniItemConfig, overrides: Partial<StatView> = {}): StatView {
  return {
    autoRule: null,
    config: { base: config, blockRules: {} },
    createdAt: 1,
    id: 'view-1',
    isActive: true,
    isAutoEnabled: false,
    name: 'Default',
    scope: 'dashboard',
    sortOrder: 0,
    updatedAt: 1,
    userId: 'user-1',
    ...overrides,
  }
}

function configWith(type: 'bar' | 'line' | 'pie'): MiniItemConfig {
  const config = structuredClone(defaultConfig)
  config.chart.type = type
  return config
}

async function flush() {
  for (let index = 0; index < 20; index++) {
    await nextTick()
    await Promise.resolve()
  }
}

describe('useStatViewController', () => {
  it('applies the already active view when a contextual page mounts', async () => {
    const activeConfig = configWith('pie')
    const view = makeView(activeConfig)
    const update = vi.fn()

    h.store = {
      create: vi.fn(),
      defaultViewId: vi.fn(),
      isDemo: true,
      isLoaded: true,
      setActive: vi.fn(),
      update,
      updateMany: vi.fn(),
      views: [view],
    }

    const config = ref(configWith('line'))
    useStatViewController(config, ref(makeContext()))
    await flush()

    expect(config.value).toEqual(activeConfig)
    expect(update).not.toHaveBeenCalled()
  })

  it('binds a view to its page without rewriting either view', async () => {
    const bound = makeView(configWith('pie'), {
      autoRule: { children: [{ ids: ['cat-1'], kind: 'categorySelection', mode: 'selected' }], operator: 'and' },
      id: 'view-bound',
      isActive: false,
      isAutoEnabled: true,
      name: 'Bound',
      sortOrder: 1,
    })
    const items = shallowRef<StatView[]>([makeView(configWith('line')), bound])
    const update = vi.fn()
    const setActive = vi.fn(async (id: string) => {
      items.value = items.value.map(view => ({ ...view, isActive: view.id === id }))
    })

    h.store = {
      create: vi.fn(),
      defaultViewId: vi.fn(),
      isDemo: true,
      isLoaded: true,
      setActive,
      update,
      updateMany: vi.fn(),
      get views() { return items.value },
    }

    const config = ref(configWith('line'))
    const context = ref(makeContext())
    const controller = useStatViewController(config, context)
    await flush()

    context.value = makeContext('cat-1')
    await flush()

    expect(controller.activeId.value).toBe('view-bound')
    expect(config.value.chart.type).toBe('pie')
    // The binding is local: the stored pick and both saved configs stay untouched.
    expect(setActive).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
    expect(items.value.map(view => view.config.base.chart.type)).toEqual(['line', 'pie'])

    context.value = makeContext()
    await flush()

    expect(controller.activeId.value).toBe('view-1')
    expect(config.value.chart.type).toBe('line')
    expect(update).not.toHaveBeenCalled()
  })

  it('keeps a manually picked view while the page stays put', async () => {
    const other = makeView(configWith('pie'), { id: 'view-2', isActive: false, name: 'Other', sortOrder: 1 })
    const items = shallowRef<StatView[]>([makeView(configWith('line')), other])
    const update = vi.fn()

    h.store = {
      create: vi.fn(),
      defaultViewId: vi.fn(),
      isDemo: true,
      isLoaded: true,
      setActive: vi.fn(async (id: string) => {
        items.value = items.value.map(view => ({ ...view, isActive: view.id === id }))
      }),
      update,
      updateMany: vi.fn(),
      get views() { return items.value },
    }

    const config = ref(configWith('line'))
    const context = ref(makeContext())
    const controller = useStatViewController(config, context)
    await flush()

    controller.apply(items.value[1]!)
    await flush()

    // A resize or a period change must not hand the view back to another one.
    context.value = { ...makeContext(), categoryCount: 40, contentWidth: 1200 }
    await flush()

    expect(controller.activeId.value).toBe('view-2')
    expect(config.value.chart.type).toBe('pie')
    expect(items.value.map(view => view.config.base.chart.type)).toEqual(['line', 'pie'])
    expect(update).not.toHaveBeenCalled()
  })
})
