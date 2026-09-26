import type { Row } from '~~/services/powersync/transforms'

import localforage from 'localforage'
import { watchTable } from '~~/services/powersync/db'
import { deleteRow, upsertRows } from '~~/services/powersync/mutations'

import { useDemo } from '~/components/demo/useDemo'
import { resolveWriteUid } from '~/composables/useAuthSession'
import { persistStoreCache } from '~/composables/useStoreCache'
import { showErrorToast } from '~/composables/useStoreSync'
import { useSupabaseAuth } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

import type { ConditionGroup, StatView, StatViewScope } from './types'

import { adaptiveView, adaptiveViewConfig, isAdaptiveViewId } from './adaptiveView'
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
  const { $i18n } = useNuxtApp()
  const items = shallowRef<StatView[]>([])
  const isLoaded = ref(false)
  const activeScope = ref<StatViewScope>('dashboard')
  let watchController: AbortController | null = null

  // Views created before ordering existed share sortOrder 0, so ties must break on something
  // stable - otherwise every write reshuffles the list and the drag handler persists it back.
  function compareViews(a: StatView, b: StatView) {
    return a.sortOrder - b.sortOrder || a.createdAt - b.createdAt || a.id.localeCompare(b.id)
  }

  // Saved views only; `views` prepends the built-in adaptive one.
  const savedViews = computed(() => items.value.toSorted(compareViews))
  const views = computed(() => [
    adaptiveView($i18n.t('stat.views.adaptive'), activeScope.value, !savedViews.value.some(view => view.isActive)),
    ...savedViews.value,
  ])

  function setItems(next: StatView[]) {
    items.value = next.toSorted(compareViews)
  }

  function parseViews(values: unknown[]): StatView[] {
    return values.map((value) => {
      const parsed = StatViewSchema.safeParse(value)
      return parsed.success ? parsed.data as StatView : null
    }).filter((view): view is StatView => !!view)
  }

  /** Cold-start paint from the per-user snapshot, so the saved layout shows before SQLite emits. */
  function primeFromCache(data: unknown[] | null): void {
    if (isDemo.value || !data || isLoaded.value)
      return
    setItems(parseViews(data))
  }

  async function init(scope: StatViewScope = 'dashboard') {
    activeScope.value = scope
    watchController?.abort()
    isLoaded.value = false
    if (isDemo.value) {
      const stored = await localforage.getItem<unknown[]>(`${DEMO_KEY}.${scope}`)
      setItems(parseViews(stored ?? []).filter(view => view.scope === scope))
      isLoaded.value = true
      return
    }
    watchController = watchTable<Row>('SELECT * FROM stat_views WHERE scope = ? ORDER BY "sortOrder"', [scope], (rows) => {
      const received = rows.map(rowToView).filter((view): view is StatView => !!view)
      const normalized = normalizeActiveViews(received)
      setItems(normalized)
      isLoaded.value = true
      persistStoreCache('statViews', normalized)
      const changed = normalized.filter((view, index) => view.isActive !== received[index]!.isActive)
      if (changed.length) {
        void upsertRows('stat_views', changed.map(view => ({ id: view.id, row: viewToRow(view) })))
          .catch(error => logger.error('active view reconciliation failed', error))
      }
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

  async function create(values: Pick<StatView, 'autoRule' | 'config' | 'isAutoEnabled' | 'name' | 'scope'> & Partial<Pick<StatView, 'id'>>) {
    const existing = values.id ? items.value.find(view => view.id === values.id) : null
    if (existing)
      return existing
    const now = Date.now()
    const view: StatView = {
      ...values,
      autoRule: values.autoRule as ConditionGroup | null,
      createdAt: now,
      id: values.id ?? crypto.randomUUID(),
      isActive: !savedViews.value.some(view => view.scope === values.scope && view.isActive),
      sortOrder: savedViews.value.filter(item => item.scope === values.scope).length,
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

  // Editing the built-in view forks it: the copy is named "Mine", carries the patch and takes over
  // as the active view, so the adaptive defaults stay pristine.
  async function forkAdaptive(patch: StatViewPatch) {
    const names = new Set(savedViews.value.map(view => view.name))
    const base = $i18n.t('stat.views.mine')
    let name = base
    for (let suffix = 2; names.has(name); suffix++)
      name = `${base} ${suffix}`
    const view = await create({
      autoRule: patch.autoRule ?? null,
      config: patch.config ?? adaptiveViewConfig(),
      isAutoEnabled: patch.isAutoEnabled ?? false,
      name,
      scope: activeScope.value,
    })
    await setActive(view.id)
    return items.value.find(item => item.id === view.id) ?? view
  }

  async function update(id: string, patch: StatViewPatch) {
    if (isAdaptiveViewId(id))
      return forkAdaptive(patch)
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
    const patches = new Map(updates.filter(update => !isAdaptiveViewId(update.id)).map(update => [update.id, update.patch]))
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
    if (isAdaptiveViewId(id))
      return
    const previous = items.value
    const removed = previous.find(view => view.id === id)
    if (!removed)
      return
    const remaining = previous.filter(view => view.id !== id)
    const fallbackIndex = Math.min(previous.indexOf(removed), remaining.length - 1)
    const next = remaining.map((view, sortOrder) => ({
      ...view,
      isActive: removed.isActive ? sortOrder === fallbackIndex : view.isActive,
      sortOrder,
      updatedAt: Date.now(),
    }))
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
    const next = ids.filter(id => !isAdaptiveViewId(id)).map((id, sortOrder) => byId.get(id) && ({ ...byId.get(id)!, sortOrder, updatedAt: Date.now() })).filter((view): view is StatView => !!view)
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

  // The adaptive view is "active" by absence: picking it clears every saved flag.
  async function setActive(id: string | null) {
    const previous = items.value
    const now = Date.now()
    const next = previous.map((view) => {
      const isActive = view.id === id && !isAdaptiveViewId(id)
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

  return { create, init, isDemo, isLoaded, items, primeFromCache, remove, reorder, savedViews, setActive, update, updateMany, views }
})

export { normalizeActiveViews, rowToView, viewToRow }
