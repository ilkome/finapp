<script setup lang="ts">
import type { BudgetId, BudgetItem } from '~/components/budgets/types'
import type { BudgetProgress } from '~/components/budgets/useBudgetProgress'

import { useBudgetsStore } from '~/components/budgets/useBudgetsStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'

type GroupKey = 'expense' | 'income' | 'archived'

const props = defineProps<{
  periodStart: number
  progressFor: (id: BudgetId) => BudgetProgress | undefined
}>()

const emit = defineEmits<{
  edit: [id: BudgetId]
  history: [id: BudgetId]
  move: [id: BudgetId]
}>()

const { t } = useI18n()
const budgetsStore = useBudgetsStore()
const currenciesStore = useCurrenciesStore()

// Archived budgets group last, separate from the active expense/income kinds.
const order: GroupKey[] = ['expense', 'income', 'archived']

const groups = computed(() => {
  const buckets: Record<GroupKey, { budget: BudgetItem, id: BudgetId }[]> = { archived: [], expense: [], income: [] }
  for (const [id, budget] of Object.entries(budgetsStore.items ?? {}))
    buckets[budget.status === 'archived' ? 'archived' : budget.kind].push({ budget, id })
  return buckets
})

// Rolled-up activity/assigned/available per group (2.4), shown once a group has several budgets.
const subtotals = computed(() => {
  const out = {} as Record<GroupKey, { activity: number, assigned: number, available: number }>
  for (const key of order) {
    const sum = { activity: 0, assigned: 0, available: 0 }
    for (const e of groups.value[key]) {
      const p = props.progressFor(e.id)
      if (p) {
        sum.activity += p.activity
        sum.assigned += p.assigned
        sum.available += p.available
      }
    }
    out[key] = sum
  }
  return out
})

function groupLabel(key: GroupKey) {
  return key === 'archived' ? t('budgets.archived') : t(`budgets.kind.${key}`)
}
</script>

<template>
  <div class="grid gap-4">
    <div v-for="key in order" :key="key">
      <template v-if="groups[key].length">
        <UiTextSubtitle class="mb-1 px-1 tracking-wide uppercase">
          {{ groupLabel(key) }} ({{ groups[key].length }})
        </UiTextSubtitle>

        <!-- Group subtotal (rolled up once there are several budgets) -->
        <div v-if="key !== 'archived' && groups[key].length > 1" class="text-2xs text-muted mb-1 flex flex-wrap items-center gap-x-3 px-1">
          <span class="flex items-center gap-1">
            {{ t(`budgets.triad.${key}.activity`) }}
            <Amount :amount="subtotals[key].activity" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
          </span>
          <span class="flex items-center gap-1">
            {{ t(`budgets.triad.${key}.assigned`) }}
            <Amount :amount="subtotals[key].assigned" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
          </span>
          <span class="flex items-center gap-1">
            {{ t(`budgets.triad.${key}.remaining`) }}
            <Amount :amount="subtotals[key].available" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
          </span>
        </div>
        <div class="grid gap-1">
          <template
            v-for="entry in groups[key]"
            :key="entry.id"
          >
            <BudgetsItem
              v-if="props.progressFor(entry.id)"
              :id="entry.id"
              :budget="entry.budget"
              :periodStart="props.periodStart"
              :progress="props.progressFor(entry.id)!"
              @edit="emit('edit', $event)"
              @history="emit('history', $event)"
              @move="emit('move', $event)"
            />
          </template>
        </div>
      </template>
    </div>
  </div>
</template>
