import localforage from 'localforage'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { defaultConfig } from '~/components/stat/config/schema'
import { ADAPTIVE_VIEW_ID } from '~/components/stat/views/adaptiveView'
import { StatViewSchema } from '~/components/stat/views/schema'
import { normalizeActiveViews, rowToView, useStatViewsStore, viewToRow } from '~/components/stat/views/useStatViewsStore'

const h = vi.hoisted(() => ({
  auth: { uid: { value: null } },
  demo: { value: true },
  persistStoreCache: vi.fn(),
  upsertRows: vi.fn(),
  watchTable: vi.fn(),
}))

vi.mock('localforage', () => ({ default: { getItem: vi.fn(), setItem: vi.fn() } }))
vi.mock('~~/services/powersync/db', () => ({ watchTable: h.watchTable }))
vi.mock('~~/services/powersync/mutations', () => ({ deleteRow: vi.fn(), upsertRows: h.upsertRows }))
vi.mock('~/components/demo/useDemo', () => ({ useDemo: () => ({ isDemo: h.demo }) }))
vi.mock('~/composables/useSupabase', () => ({ useSupabaseAuth: () => h.auth }))
vi.mock('~/composables/useStoreCache', () => ({ persistStoreCache: h.persistStoreCache }))

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
    expect(store.savedViews).toEqual([view])
    expect(localforage.setItem).toHaveBeenCalledWith('finapp.statViews.dashboard', [view])
    expect(h.upsertRows).not.toHaveBeenCalled()
  })

  it('keeps one selected view for every device', async () => {
    const store = useStatViewsStore()
    await store.init()
    const first = await store.create({ autoRule: null, config: { base: structuredClone(defaultConfig), blockRules: {} }, isAutoEnabled: false, name: 'First', scope: 'dashboard' })
    const second = await store.create({ autoRule: null, config: { base: structuredClone(defaultConfig), blockRules: {} }, isAutoEnabled: false, name: 'Second', scope: 'dashboard' })

    await store.setActive(second.id)

    expect(store.savedViews).toMatchObject([
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

  it('always lists the built-in adaptive view first and marks it active when nothing else is', async () => {
    const store = useStatViewsStore()
    await store.init()

    expect(store.views).toMatchObject([{ id: ADAPTIVE_VIEW_ID, isActive: true, name: 'stat.views.adaptive' }])

    const view = await store.create({ autoRule: null, config: { base: structuredClone(defaultConfig), blockRules: {} }, isAutoEnabled: false, name: 'Saved', scope: 'dashboard' })
    expect(store.views).toMatchObject([{ id: ADAPTIVE_VIEW_ID, isActive: false }, { id: view.id, isActive: true }])

    await store.setActive(ADAPTIVE_VIEW_ID)
    expect(store.views).toMatchObject([{ id: ADAPTIVE_VIEW_ID, isActive: true }, { id: view.id, isActive: false }])
  })

  it('forks the adaptive view into "mine" instead of editing it, and never removes it', async () => {
    const store = useStatViewsStore()
    await store.init()

    const rule = { children: [{ ids: [], kind: 'walletSelection' as const, mode: 'any' as const }], operator: 'and' as const }
    const forked = await store.update(ADAPTIVE_VIEW_ID, { autoRule: rule, isAutoEnabled: true })

    expect(forked).toMatchObject({ autoRule: rule, isActive: true, isAutoEnabled: true, name: 'stat.views.mine' })
    expect(forked?.config.blockRules.catsRound).toHaveLength(3)
    expect(store.views).toMatchObject([{ id: ADAPTIVE_VIEW_ID, isActive: false }, { id: forked!.id }])

    await store.remove(ADAPTIVE_VIEW_ID)
    expect(store.views[0]?.id).toBe(ADAPTIVE_VIEW_ID)
  })

  it('activates the adjacent view when the active view is removed', async () => {
    const store = useStatViewsStore()
    await store.init()
    const first = await store.create({ autoRule: null, config: { base: structuredClone(defaultConfig), blockRules: {} }, isAutoEnabled: false, name: 'First', scope: 'dashboard' })
    const second = await store.create({ autoRule: null, config: { base: structuredClone(defaultConfig), blockRules: {} }, isAutoEnabled: false, name: 'Second', scope: 'dashboard' })

    await store.remove(first.id)

    expect(store.savedViews).toMatchObject([{ id: second.id, isActive: true, sortOrder: 0 }])
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

describe('cold-start snapshot', () => {
  const saved = (id: string) => StatViewSchema.parse({
    autoRule: null,
    config: { base: structuredClone(defaultConfig), blockRules: {} },
    createdAt: 1,
    id,
    isActive: true,
    isAutoEnabled: false,
    name: id,
    scope: 'dashboard',
    sortOrder: 0,
    updatedAt: 1,
    userId: 'u1',
  })

  beforeEach(() => {
    setActivePinia(createPinia())
    h.demo.value = false
    h.persistStoreCache.mockReset()
    h.watchTable.mockReset()
  })

  it('shows the cached views before the first watch emission, skipping invalid ones', async () => {
    const store = useStatViewsStore()
    store.primeFromCache([saved('mine'), { broken: true }])
    await store.init('dashboard')

    expect(store.isLoaded).toBe(false)
    expect(store.savedViews.map(view => view.id)).toEqual(['mine'])
  })

  it('mirrors every watch emission into the snapshot', async () => {
    const store = useStatViewsStore()
    await store.init('dashboard')
    const onRows = h.watchTable.mock.calls[0]![2] as (rows: unknown[]) => void
    onRows([viewToRow(saved('mine'))].map(row => ({ ...row, id: 'mine' })))

    expect(h.persistStoreCache).toHaveBeenCalledWith('statViews', [expect.objectContaining({ id: 'mine' })])
  })
})
