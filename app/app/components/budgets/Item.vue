<script setup lang="ts">
import type { BudgetId, BudgetItem } from '~/components/budgets/types'
import type { BudgetProgress } from '~/components/budgets/useBudgetProgress'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'

const props = defineProps<{
  budget: BudgetItem
  id: BudgetId
  progress: BudgetProgress
}>()

const emit = defineEmits<{
  edit: [id: BudgetId]
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()

const category = computed(() => categoriesStore.items?.[props.budget.categoryId])

function pct(value: number, of: number): number {
  if (of <= 0)
    return 0
  return Math.max(0, Math.min(100, (value / of) * 100))
}

// Bar fills toward the assigned amount; over-budget paints the whole bar in the error color.
const fillPct = computed(() => pct(props.progress.activity, props.progress.assigned))
const pacePct = computed(() => pct(props.progress.pace, props.progress.assigned))
const isOver = computed(() => props.progress.available < 0)
</script>

<template>
  <div class="bg-elevated rounded-md px-3 py-2">
    <div class="flex items-center gap-2">
      <div
        class="flex size-8 shrink-0 items-center justify-center rounded-full"
        :style="{ background: category?.color ?? 'var(--ui-bg-accented)' }"
      >
        <Icon :name="category?.icon ?? 'lucide:folder'" size="18" class="text-white" />
      </div>

      <div class="min-w-0 grow">
        <div class="text-highlighted truncate text-sm">
          {{ category?.name ?? props.budget.categoryId }}
        </div>
        <div class="text-2xs text-muted">
          {{ t(`budgets.kind.${props.budget.kind}`) }}
          <template v-if="props.budget.rollover !== 'none'">
            · {{ t(`budgets.rollover.${props.budget.rollover}`) }}
          </template>
        </div>
      </div>

      <button
        type="button"
        class="bg-default text-2xs text-muted hover:text-highlighted rounded-sm px-2 py-1"
        @click="emit('edit', props.id)"
      >
        {{ t('budgets.actions.edit') }}
      </button>
    </div>

    <!-- Triad -->
    <div class="text-2xs mt-2 flex items-center justify-between gap-2">
      <div class="text-muted">
        {{ t('budgets.triad.spent') }}
        <Amount :amount="progress.activity" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
      </div>
      <div class="text-muted">
        {{ t('budgets.triad.assigned') }}
        <Amount :amount="progress.assigned" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
      </div>
      <div :class="isOver ? 'text-error' : 'text-highlighted'">
        {{ t('budgets.triad.available') }}
        <Amount :amount="progress.available" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
      </div>
    </div>

    <!-- Progress bar with pace marker -->
    <div class="bg-default relative mt-2 h-2 rounded-full">
      <div
        class="h-full rounded-full transition-all"
        :class="isOver ? 'bg-error' : 'bg-primary'"
        :style="{ width: `${fillPct}%` }"
      />
      <!-- Pace = where spending "should" be by now; contrasts against both the track and the fill. -->
      <div
        v-if="pacePct > 0 && pacePct < 100"
        class="bg-inverted ring-default absolute -top-1 h-4 w-[3px] -translate-x-1/2 rounded-full ring-1"
        :style="{ left: `${pacePct}%` }"
        :title="t('budgets.pace')"
      />
    </div>

    <!-- Rollover + projection + committed -->
    <div class="text-2xs text-muted mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
      <span v-if="progress.carried !== 0" class="flex items-center gap-1">
        <Icon name="lucide:rotate-ccw" size="11" />
        {{ t('budgets.carried') }}
        <Amount :amount="progress.carried" :currencyCode="currenciesStore.base" :isShowBaseRate="false" :isShowPlus="progress.carried > 0" align="left" variant="xs" />
      </span>
      <span class="flex items-center gap-1">
        {{ t('budgets.projected') }}
        <Amount :amount="progress.projected" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
      </span>
      <span v-if="progress.committed > 0" class="flex items-center gap-1">
        <Amount :amount="progress.committed" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
        {{ t('budgets.committed') }}
      </span>
      <span v-if="isOver" class="text-error">{{ t('budgets.overBudget') }}</span>
    </div>
  </div>
</template>
