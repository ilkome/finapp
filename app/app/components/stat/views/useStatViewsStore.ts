import type { Row } from '~~/services/powersync/transforms'

import localforage from 'localforage'
import { watchTable } from '~~/services/powersync/db'
import { deleteRow, upsertRows } from '~~/services/powersync/mutations'

import { useDemo } from '~/components/demo/useDemo'
import { resolveWriteUid } from '~/composables/useAuthSession'
import { showErrorToast } from '~/composables/useStoreSync'
import { useSupabaseAuth } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

import type { ConditionGroup, StatView, StatViewScope } from './types'

import { StatViewSchema } from './schema'

type StatViewPatch = Partial<Pick<StatView, 'autoRule' | 'config' | 'isActive' | 'isAutoEnabled' | 'name'>>

const logger = createLogger('stat-views')
const DEMO_KEY = 'finapp.statViews'
const DEMO_USER_ID = 'demo'

function rowToView(row: Row): StatView | null {
  try {
    const parsed = StatViewSchema.safeParse({
      ...row,
      autoRule: row.autoRule ? JSON.parse(String(row.autoRule)) : null,
      config: JSON.parse(String(row.config)),
      isActive: !!row.isActive,
      isAutoEnabled: !!row.isAutoEnabled,
      sortOrder: Number(row.sortOrder),
    })
    return parsed.success ? parsed.data as StatView : null
  }
  catch (error) {
    logger.warn('skipping invalid synced view', error)
    return null
  }
}

function viewToRow(view: StatView): Record<string, unknown> {
  const parsed = StatViewSchema.parse(view)
  return {
    autoRule: parsed.autoRule ? JSON.stringify(parsed.autoRule) : null,
    config: JSON.stringify(parsed.config),
    createdAt: parsed.createdAt,
    isActive: parsed.isActive ? 1 : 0,
    isAutoEnabled: parsed.isAutoEnabled ? 1 : 0,
    name: parsed.name,
    scope: parsed.scope,
    sortOrder: parsed.sortOrder,
    updatedAt: parsed.updatedAt,
    userId: parsed.userId,
  }
}

function normalizeActiveViews(views: StatView[]): StatView[] {
  const activeByScope = Map.groupBy(views.filter(view => view.isActive), view => view.scope)
  const winners = new Set([...activeByScope.values()].map((active) => {
    return active.toSorted((a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id))[0]!.id
  }))
  return views.map(view => view.isActive && !winners.has(view.id) ? { ...view, isActive: false } : view)
}

export const useStatViewsStore = defineStore('statViews', () => {
  const { isDemo } = useDemo()
  const { uid } = useSupabaseAuth()
  const items = shallowRef<StatView[]>([])
  const isLoaded = ref(false)
  let watchController: AbortController | null = null

  const views = computed(() => items.value.toSorted((a, b) => a.sortOrder - b.sortOrder))

  function setItems(next: StatView[]) {
    items.value = next.toSorted((a, b) => a.sortOrder - b.sortOrder)
  }

  async function init(scope: StatViewScope = 'dashboard') {
    watchController?.abort()
    isLoaded.value = false
    if (isDemo.value) {
      const stored = await localforage.getItem<unknown[]>(`${DEMO_KEY}.${scope}`)
      setItems((stored ?? []).map((value) => {
        const parsed = StatViewSchema.safeParse(value)
        return parsed.success ? parsed.data as StatView : null
      }).filter((view): view is StatView => !!view && view.scope === scope))
      isLoaded.value = true
      return
    }
    watchController = watchTable<Row>('SELECT * FROM stat_views WHERE scope = ? ORDER BY "sortOrder"', [scope], (rows) => {
      const received = rows.map(rowToView).filter((view): view is StatView => !!view)
      const normalized = normalizeActiveViews(received)
      setItems(normalized)
      isLoaded.value = true
      const changed = normalized.filter((view, index) => view.isActive !== received[index]!.isActive)
      if (changed.length)
        void upsertRows('stat_views', changed.map(view => ({ id: view.id, row: viewToRow(view) })))
          .catch(error => logger.error('active view reconciliation failed', error))
    })
  }

  async function persist(next: StatView[], changed: StatView[] = next) {
    setItems(next)
    if (isDemo.value) {
      await localforage.setItem(`${DEMO_KEY}.${changed[0]?.scope ?? 'dashboard'}`, next)
      return
    }
    await upsertRows('stat_views', changed.map(view => ({ id: view.id, row: viewToRow(view) })))
  }

  async function create(values: Pick<StatView, 'autoRule' | 'config' | 'isAutoEnabled' | 'name' | 'scope'>) {
    const now = Date.now()
    const view: StatView = {
      ...values,
      autoRule: values.autoRule as ConditionGroup | null,
      createdAt: now,
      id: crypto.randomUUID(),
      isActive: !views.value.some(view => view.scope === values.scope && view.isActive),
      sortOrder: views.value.filter(item => item.scope === values.scope).length,
      updatedAt: now,
      userId: isDemo.value ? DEMO_USER_ID : resolveWriteUid(uid.value),
    }
    const valid = StatViewSchema.parse(view) as StatView
    const next = [...items.value, valid]
    try {
      await persist(next, [valid])
    }
    catch (error) {
      setItems(items.value.filter(item => item.id !== valid.id))
      logger.error('create failed', error)
      showErrorToast('stat.views.errors.save')
      throw error
    }
    return valid
  }

  async function update(id: string, patch: StatViewPatch) {
    const current = items.value.find(view => view.id === id)
    if (!current)
      return null
    const nextView = StatViewSchema.parse({ ...current, ...patch, updatedAt: Date.now() }) as StatView
    const previous = items.value
    try {
      await persist(previous.map(view => view.id === id ? nextView : view), [nextView])
    }
    catch (error) {
      setItems(previous)
      logger.error('update failed', error)
      showErrorToast('stat.views.errors.save')
      throw error
    }
    return nextView
  }

  async function updateMany(updates: Array<{ id: string, patch: StatViewPatch }>) {
    const patches = new Map(updates.map(update => [update.id, update.patch]))
    const previous = items.value
    const changed: StatView[] = []
    const now = Date.now()
    const next = previous.map((view) => {
      const patch = patches.get(view.id)
      if (!patch)
        return view
      const nextView = StatViewSchema.parse({ ...view, ...patch, updatedAt: now }) as StatView
      changed.push(nextView)
      return nextView
    })
    if (!changed.length)
      return changed
    try {
      await persist(next, changed)
    }
    catch (error) {
      setItems(previous)
      logger.error('bulk update failed', error)
      showErrorToast('stat.views.errors.save')
      throw error
    }
    return changed
  }

  async function remove(id: string) {
    const previous = items.value
    const removed = previous.find(view => view.id === id)
    if (!removed)
      return
    const next = previous.filter(view => view.id !== id).map((view, sortOrder) => ({ ...view, sortOrder, updatedAt: Date.now() }))
    setItems(next)
    try {
      if (isDemo.value) {
        await localforage.setItem(`${DEMO_KEY}.${removed.scope}`, next)
      }
      else {
        await deleteRow('stat_views', id)
        await upsertRows('stat_views', next.map(view => ({ id: view.id, row: viewToRow(view) })))
      }
    }
    catch (error) {
      setItems(previous)
      logger.error('delete failed', error)
      showErrorToast('stat.views.errors.delete')
      throw error
    }
  }

  async function reorder(ids: string[]) {
    const previous = items.value
    const byId = new Map(previous.map(view => [view.id, view]))
    const next = ids.map((id, sortOrder) => byId.get(id) && ({ ...byId.get(id)!, sortOrder, updatedAt: Date.now() })).filter((view): view is StatView => !!view)
    if (next.length !== previous.length)
      return
    try {
      await persist(next, next)
    }
    catch (error) {
      setItems(previous)
      logger.error('reorder failed', error)
      showErrorToast('stat.views.errors.order')
      throw error
    }
  }

  async function setActive(id: string | null) {
    const previous = items.value
    const now = Date.now()
    const next = previous.map((view) => {
      const isActive = view.id === id
      return isActive === view.isActive ? view : { ...view, isActive, updatedAt: now }
    })
    const changed = next.filter((view, index) => view.isActive !== previous[index]!.isActive)
    if (!changed.length)
      return
    try {
      await persist(next, changed)
    }
    catch (error) {
      setItems(previous)
      logger.error('set active failed', error)
      showErrorToast('stat.views.errors.save')
      throw error
    }
  }

  return { create, init, isDemo, isLoaded, items, remove, reorder, setActive, update, updateMany, views }
})

export { normalizeActiveViews, rowToView, viewToRow }
