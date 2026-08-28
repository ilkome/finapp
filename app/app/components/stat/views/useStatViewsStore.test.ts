import localforage from 'localforage'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { defaultConfig } from '~/components/stat/config/schema'
import { useStatViewsStore } from '~/components/stat/views/useStatViewsStore'

const h = vi.hoisted(() => ({
  auth: { uid: { value: null } },
  demo: { value: true },
  upsertRows: vi.fn(),
  watchTable: vi.fn(),
}))

vi.mock('localforage', () => ({ default: { getItem: vi.fn(), setItem: vi.fn() } }))
vi.mock('~~/services/powersync/db', () => ({ watchTable: h.watchTable }))
vi.mock('~~/services/powersync/mutations', () => ({ deleteRow: vi.fn(), upsertRows: h.upsertRows }))
vi.mock('~/components/demo/useDemo', () => ({ useDemo: () => ({ isDemo: h.demo }) }))
vi.mock('~/composables/useSupabase', () => ({ useSupabaseAuth: () => h.auth }))

describe('useStatViewsStore demo persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    h.demo.value = true
    vi.mocked(localforage.getItem).mockReset().mockResolvedValue([])
    vi.mocked(localforage.setItem).mockReset().mockResolvedValue(undefined)
  })

  it('creates and persists a valid local view without an authenticated user', async () => {
    const store = useStatViewsStore()
    await store.init()

    const view = await store.create({
      autoRule: null,
      config: structuredClone(defaultConfig),
      isAutoEnabled: false,
      name: 'Classic',
      scope: 'dashboard',
    })

    expect(view.userId).toBe('demo')
    expect(store.views).toEqual([view])
    expect(localforage.setItem).toHaveBeenCalledWith('finapp.statViews.dashboard', [view])
    expect(h.upsertRows).not.toHaveBeenCalled()
  })
})
