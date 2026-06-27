import type { Row } from '~~/services/powersync/transforms'

import { useStorage } from '@vueuse/core'
import { watchTable } from '~~/services/powersync/db'
import { deleteRow, upsertRow } from '~~/services/powersync/mutations'
import { budgetAssignmentToRow, budgetToRow, rowToBudget, rowToBudgetAssignment } from '~~/services/powersync/transforms'
import { generateId } from '~~/utils/generateId'

import type { BudgetAssignmentId, BudgetAssignmentItem, BudgetAssignments, BudgetId, BudgetItem, BudgetMode, Budgets } from '~/components/budgets/types'

import { useDemo } from '~/components/demo/useDemo'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { resolveWriteUid } from '~/composables/useAuthSession'
import { createDebouncedPersist, showErrorToast } from '~/composables/useStoreSync'
import { useSupabaseAuth } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

const logger = createLogger('budgets')

/** Global, persisted budgeting mode. v1 ships `limits`; envelope / 50-30-20 are P4. */
export function useBudgetMode() {
  return useStorage<BudgetMode>('finapp.budgetMode', 'limits')
}

export const useBudgetsStore = defineStore('budgets', () => {
  const { isDemo } = useDemo()
  const { uid } = useSupabaseAuth()

  const items = shallowRef<Budgets | null>(null)
  const assignments = shallowRef<BudgetAssignments | null>(null)
  const isLoaded = ref(false)
  let budgetsWatch: AbortController | null = null
  let assignmentsWatch: AbortController | null = null

  // Demo mode has no backend: mirror trns/wallets and persist mutations to localforage.
  const persistBudgets = createDebouncedPersist<Budgets>(STORAGE_KEYS.budgets)
  const persistAssignments = createDebouncedPersist<BudgetAssignments>(STORAGE_KEYS.budgetAssignments)

  /** Hydrate from the demo cache (loadDemoFromCache); the watch is bypassed in demo. */
  function setBudgets(values: Budgets | null) {
    items.value = values
  }
  function setAssignments(values: BudgetAssignments | null) {
    assignments.value = values
  }

  const hasItems = computed(() => Object.keys(items.value ?? {}).length > 0)

  // Render gate that avoids the empty-state flash during PowerSync hydration. Demo bypasses the
  // watch (isLoaded never flips), so it counts as ready immediately.
  const isReady = computed(() => isLoaded.value || isDemo.value)

  const activeItems = computed(() => {
    const out: Budgets = {}
    for (const [id, b] of Object.entries(items.value ?? {})) {
      if (b.status === 'active')
        out[id] = b
    }
    return out
  })

  function initBudgets(): void {
    if (isDemo.value)
      return

    budgetsWatch?.abort()
    isLoaded.value = false
    budgetsWatch = watchTable<Row>('SELECT * FROM budgets', [], (rows) => {
      const map: Budgets = {}
      for (const row of rows)
        map[row.id] = rowToBudget(row)
      items.value = map
      isLoaded.value = true
    })

    assignmentsWatch?.abort()
    assignmentsWatch = watchTable<Row>('SELECT * FROM budget_assignments', [], (rows) => {
      const map: BudgetAssignments = {}
      for (const row of rows)
        map[row.id] = rowToBudgetAssignment(row)
      assignments.value = map
    })

    logger.log('watching budgets')
  }

  function writeBudget(id: BudgetId, values: BudgetItem) {
    const withDate = { ...values, updatedAt: Date.now() }
    const prev = items.value
    const next = { ...(items.value ?? {}), [id]: withDate }
    items.value = next
    if (isDemo.value) {
      persistBudgets(next)
      return
    }
    upsertRow('budgets', id, budgetToRow(withDate, resolveWriteUid(uid.value))).catch((e) => {
      items.value = prev
      logger.error('saveBudget failed', e)
      showErrorToast('budgets.errors.saveFailed')
    })
  }

  /** Create or update a budget. Returns the id (generated when omitted). */
  function saveBudget(values: BudgetItem, id?: BudgetId): BudgetId {
    const budgetId = id ?? generateId()
    writeBudget(budgetId, values)
    return budgetId
  }

  function removeBudget(id: BudgetId) {
    const prev = items.value
    const next = { ...(items.value ?? {}) }
    delete next[id]
    items.value = next
    if (isDemo.value) {
      persistBudgets(next)
      return
    }
    deleteRow('budgets', id).catch((e) => {
      items.value = prev
      logger.error('removeBudget failed', e)
      showErrorToast('budgets.errors.deleteFailed')
    })
  }

  function archiveBudget(id: BudgetId) {
    const budget = items.value?.[id]
    if (!budget)
      return
    writeBudget(id, { ...budget, status: 'archived' })
  }

  /** An active budget already occupying this budget's category+kind slot (excluding itself). */
  function activeConflictFor(budget: BudgetItem, selfId: BudgetId): BudgetId | undefined {
    for (const [id, b] of Object.entries(items.value ?? {})) {
      if (id !== selfId && b.status === 'active' && b.kind === budget.kind && b.categoryId === budget.categoryId)
        return id
    }
    return undefined
  }

  // Restore an archived budget. Refuses when an active budget already covers the same category+kind
  // (two active budgets on one category double-count its spend); returns the conflicting id so the
  // caller can offer to archive it. See plans/budgets-recurrences-followup.md (A2).
  function unarchiveBudget(id: BudgetId): { conflictId?: BudgetId, ok: boolean } {
    const budget = items.value?.[id]
    if (!budget)
      return { ok: false }
    const conflictId = activeConflictFor(budget, id)
    if (conflictId)
      return { conflictId, ok: false }
    writeBudget(id, { ...budget, status: 'active' })
    return { ok: true }
  }

  /** The assigned override for a budget+period, or undefined (then budgets.amount applies). */
  function findAssignmentId(budgetId: BudgetId, periodStart: number): BudgetAssignmentId | undefined {
    for (const [id, a] of Object.entries(assignments.value ?? {})) {
      if (a.budgetId === budgetId && a.periodStart === periodStart)
        return id
    }
    return undefined
  }

  function assignmentFor(budgetId: BudgetId, periodStart: number): number | undefined {
    const id = findAssignmentId(budgetId, periodStart)
    return id ? assignments.value?.[id]?.assigned : undefined
  }

  /** Set (or replace) the per-period assigned amount for a budget (envelope / auto-budget / tweak). */
  function setAssignment(budgetId: BudgetId, periodStart: number, assigned: number) {
    const existingId = findAssignmentId(budgetId, periodStart)
    const id = existingId ?? generateId()
    const values: BudgetAssignmentItem = { assigned, budgetId, periodStart, updatedAt: Date.now() }
    const prev = assignments.value
    const next = { ...(assignments.value ?? {}), [id]: values }
    assignments.value = next
    if (isDemo.value) {
      persistAssignments(next)
      return
    }
    upsertRow('budget_assignments', id, budgetAssignmentToRow(values, resolveWriteUid(uid.value))).catch((e) => {
      assignments.value = prev
      logger.error('setAssignment failed', e)
      showErrorToast('budgets.errors.saveFailed')
    })
  }

  /** Drop the per-period override so the budget's normalized default applies again. */
  function clearAssignment(budgetId: BudgetId, periodStart: number) {
    const id = findAssignmentId(budgetId, periodStart)
    if (!id)
      return
    const prev = assignments.value
    const next = { ...(assignments.value ?? {}) }
    delete next[id]
    assignments.value = next
    if (isDemo.value) {
      persistAssignments(next)
      return
    }
    deleteRow('budget_assignments', id).catch((e) => {
      assignments.value = prev
      logger.error('clearAssignment failed', e)
      showErrorToast('budgets.errors.saveFailed')
    })
  }

  return {
    activeItems,
    archiveBudget,
    assignmentFor,
    assignments,
    clearAssignment,
    hasItems,
    initBudgets,
    isLoaded,
    isReady,
    items,
    removeBudget,
    saveBudget,
    setAssignment,
    setAssignments,
    setBudgets,
    unarchiveBudget,
  }
})
