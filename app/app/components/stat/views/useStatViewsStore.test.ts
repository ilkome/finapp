import localforage from 'localforage'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { defaultConfig } from '~/components/stat/config/schema'
import { StatViewSchema } from '~/components/stat/views/schema'
import { normalizeActiveViews, rowToView, useStatViewsStore, viewToRow } from '~/components/stat/views/useStatViewsStore'

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
      config: { base: structuredClone(defaultConfig), blockRules: {} },
      isAutoEnabled: false,
      name: 'Classic',
      scope: 'dashboard',
    })

    expect(view.userId).toBe('demo')
    expect(store.views).toEqual([view])
    expect(localforage.setItem).toHaveBeenCalledWith('finapp.statViews.dashboard', [view])
    expect(h.upsertRows).not.toHaveBeenCalled()
  })

  it('keeps one selected view for every device', async () => {
    const store = useStatViewsStore()
    await store.init()
    const first = await store.create({ autoRule: null, config: { base: structuredClone(defaultConfig), blockRules: {} }, isAutoEnabled: false, name: 'First', scope: 'dashboard' })
    const second = await store.create({ autoRule: null, config: { base: structuredClone(defaultConfig), blockRules: {} }, isAutoEnabled: false, name: 'Second', scope: 'dashboard' })

    await store.setActive(second.id)

    expect(store.views).toMatchObject([
      { id: first.id, isActive: false },
      { id: second.id, isActive: true },
    ])
    expect(localforage.setItem).toHaveBeenLastCalledWith('finapp.statViews.dashboard', expect.arrayContaining([
      expect.objectContaining({ id: second.id, isActive: true }),
    ]))
  })

  it('stores active selection in the synchronized table column', async () => {
    const store = useStatViewsStore()
    await store.init()
    const view = await store.create({ autoRule: null, config: { base: structuredClone(defaultConfig), blockRules: {} }, isAutoEnabled: false, name: 'Active', scope: 'dashboard' })
    const row = viewToRow(view)

    expect(row.isActive).toBe(1)
    expect(JSON.parse(String(row.config))).not.toHaveProperty('isActive')
    expect(rowToView({ id: view.id, ...row })?.isActive).toBe(true)
  })

  it('reuses a deterministic default view created concurrently', async () => {
    const store = useStatViewsStore()
    await store.init()
    const values = {
      autoRule: null,
      config: { base: structuredClone(defaultConfig), blockRules: {} },
      id: store.defaultViewId('dashboard'),
      isAutoEnabled: false,
      name: 'Default',
      scope: 'dashboard' as const,
    }

    const [first, second] = await Promise.all([store.create(values), store.create(values)])

    expect(first.id).toBe(second.id)
    expect(store.views).toHaveLength(1)
  })

  it('activates the adjacent view when the active view is removed', async () => {
    const store = useStatViewsStore()
    await store.init()
    const first = await store.create({ autoRule: null, config: { base: structuredClone(defaultConfig), blockRules: {} }, isAutoEnabled: false, name: 'First', scope: 'dashboard' })
    const second = await store.create({ autoRule: null, config: { base: structuredClone(defaultConfig), blockRules: {} }, isAutoEnabled: false, name: 'Second', scope: 'dashboard' })

    await store.remove(first.id)

    expect(store.views).toMatchObject([{ id: second.id, isActive: true, sortOrder: 0 }])
  })
})

describe('active view conflict resolution', () => {
  it('keeps the most recently selected view active', () => {
    const older = StatViewSchema.parse({
      autoRule: null,
      config: { base: structuredClone(defaultConfig), blockRules: {} },
      createdAt: 1,
      id: 'older',
      isActive: true,
      isAutoEnabled: false,
      name: 'Older',
      scope: 'dashboard',
      sortOrder: 0,
      updatedAt: 10,
      userId: 'u1',
    })
    const newer = StatViewSchema.parse({ ...older, id: 'newer', name: 'Newer', sortOrder: 1, updatedAt: 20 })

    expect(normalizeActiveViews([older, newer]).map(view => ({ id: view.id, isActive: view.isActive }))).toEqual([
      { id: 'older', isActive: false },
      { id: 'newer', isActive: true },
    ])
  })
})
