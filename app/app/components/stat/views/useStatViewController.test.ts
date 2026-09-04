import { describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref, watch } from 'vue'

import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { StatView, StatViewContext } from '~/components/stat/views/types'

import { defaultConfig } from '~/components/stat/config/schema'
import { useStatViewController } from '~/components/stat/views/useStatViewController'

const h = vi.hoisted(() => ({
  store: null as any,
}))

vi.stubGlobal('computed', computed)
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

function makeContext(): StatViewContext {
  return {
    categoryCount: 0,
    categoryPathById: {},
    contentWidth: null,
    parentCategoryCount: 0,
    range: { end: 1, start: 0 },
    selectedCategoryIds: [],
    selectedWalletIds: [],
  }
}

function makeView(config: MiniItemConfig): StatView {
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
  }
}

describe('useStatViewController', () => {
  it('applies the already active view when a contextual page mounts', async () => {
    const activeConfig = structuredClone(defaultConfig)
    activeConfig.chart.type = 'pie'
    const pageConfig = structuredClone(defaultConfig)
    pageConfig.chart.type = 'line'
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

    const config = ref(pageConfig)
    useStatViewController(config, ref(makeContext()))
    await nextTick()
    await Promise.resolve()

    expect(config.value).toEqual(activeConfig)
    expect(update).not.toHaveBeenCalled()
  })
})
