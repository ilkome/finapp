<script setup lang="ts">
import type { BudgetId, BudgetPeriodType } from '~/components/budgets/types'

import { useBudgetsStore } from '~/components/budgets/useBudgetsStore'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { formatByLocale } from '~/components/date/utils'

type Row = { activity: number, assigned: number, periodStart: number }

const props = defineProps<{
  budgetId: BudgetId
  history: Row[]
  periodType: BudgetPeriodType
}>()

const emit = defineEmits<{
  closed: []
}>()

const { locale, t } = useI18n()
const budgetsStore = useBudgetsStore()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()

const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')

const name = computed(() => {
  const catId = budgetsStore.items?.[props.budgetId]?.categoryId
  return (catId && categoriesStore.items?.[catId]?.name) || catId || props.budgetId
})

// Only periods that actually had spend (most recent first); leading empty periods add no signal.
const rows = computed(() => props.history.filter(r => r.activity > 0).reverse())

function label(periodStart: number) {
  const fmt = props.periodType === 'year' ? 'yyyy' : props.periodType === 'week' ? 'd MMM' : 'LLL yyyy'
  return formatByLocale(periodStart, fmt, dateLocale.value)
}
function pct(row: Row) {
  if (row.assigned <= 0)
    return row.activity > 0 ? 100 : 0
  return Math.max(0, Math.min(100, (row.activity / row.assigned) * 100))
}
</script>

<template>
  <BottomSheetModal @closed="emit('closed')">
    <template #default>
      <UiTitleModal>
        {{ t('budgets.history.title') }} · {{ name }}
      </UiTitleModal>

      <div class="bottomSheetContentInside scrollerBlock grid content-start gap-3 px-3 py-2">
        <div v-if="!rows.length" class="text-muted py-6 text-center text-sm">
          {{ t('budgets.history.empty') }}
        </div>

        <div
          v-for="row in rows"
          :key="row.periodStart"
          class="grid gap-1"
        >
          <div class="text-2xs flex items-center justify-between">
            <span class="text-muted">{{ label(row.periodStart) }}</span>
            <span class="flex items-center gap-1" :class="row.activity > row.assigned ? 'text-error' : 'text-muted'">
              <Amount :amount="row.activity" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
              <span class="text-muted">/</span>
              <Amount :amount="row.assigned" :currencyCode="currenciesStore.base" :isShowBaseRate="false" align="left" variant="xs" />
            </span>
          </div>
          <div class="bg-default h-2 rounded-full">
            <div
              class="h-full rounded-full"
              :class="row.activity > row.assigned ? 'bg-error' : 'bg-primary'"
              :style="{ width: `${pct(row)}%` }"
            />
          </div>
        </div>
      </div>
    </template>
  </BottomSheetModal>
</template>
