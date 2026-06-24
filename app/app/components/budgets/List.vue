<script setup lang="ts">
import type { BudgetId, BudgetItem, BudgetKind } from '~/components/budgets/types'
import type { BudgetProgress } from '~/components/budgets/useBudgetProgress'

import { useBudgetsStore } from '~/components/budgets/useBudgetsStore'

const props = defineProps<{
  progressFor: (id: BudgetId) => BudgetProgress | undefined
}>()

const emit = defineEmits<{
  edit: [id: BudgetId]
}>()

const { t } = useI18n()
const budgetsStore = useBudgetsStore()

const order: BudgetKind[] = ['expense', 'income']

const groups = computed(() => {
  const buckets: Record<BudgetKind, { budget: BudgetItem, id: BudgetId }[]> = { expense: [], income: [] }
  for (const [id, budget] of Object.entries(budgetsStore.activeItems))
    buckets[budget.kind].push({ budget, id })
  return buckets
})
</script>

<template>
  <div class="grid gap-4">
    <div v-for="kind in order" :key="kind">
      <template v-if="groups[kind].length">
        <div class="text-2xs text-muted mb-1 px-1 tracking-wide uppercase">
          {{ t(`budgets.kind.${kind}`) }} ({{ groups[kind].length }})
        </div>
        <div class="grid gap-1">
          <template
            v-for="entry in groups[kind]"
            :key="entry.id"
          >
            <BudgetsItem
              v-if="props.progressFor(entry.id)"
              :id="entry.id"
              :budget="entry.budget"
              :progress="props.progressFor(entry.id)!"
              @edit="emit('edit', $event)"
            />
          </template>
        </div>
      </template>
    </div>
  </div>
</template>
