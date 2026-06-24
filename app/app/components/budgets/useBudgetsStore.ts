import type { Row } from '~~/services/powersync/transforms'

import { useStorage } from '@vueuse/core'
import { watchTable } from '~~/services/powersync/db'
import { deleteRow, upsertRow } from '~~/services/powersync/mutations'
import { budgetAssignmentToRow, budgetToRow, rowToBudget, rowToBudgetAssignment } from '~~/services/powersync/transforms'
import { generateId } from '~~/utils/generateId'

import type { BudgetAssignmentId, BudgetAssignmentItem, BudgetAssignments, BudgetId, BudgetItem, BudgetMode, Budgets } from '~/components/budgets/types'

import { useDemo } from '~/components/demo/useDemo'
import { resolveWriteUid } from '~/composables/useAuthSession'
import { showErrorToast } from '~/composables/useStoreSync'
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

  const hasItems = computed(() => Object.keys(items.value ?? {}).length > 0)

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
    items.value = { ...(items.value ?? {}), [id]: withDate }
    if (isDemo.value)
      return
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
    if (isDemo.value)
      return
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
    assignments.value = { ...(assignments.value ?? {}), [id]: values }
    if (isDemo.value)
      return
    upsertRow('budget_assignments', id, budgetAssignmentToRow(values, resolveWriteUid(uid.value))).catch((e) => {
      assignments.value = prev
      logger.error('setAssignment failed', e)
      showErrorToast('budgets.errors.saveFailed')
    })
  }

  return {
    activeItems,
    archiveBudget,
    assignmentFor,
    assignments,
    hasItems,
    initBudgets,
    isLoaded,
    items,
    removeBudget,
    saveBudget,
    setAssignment,
  }
})
