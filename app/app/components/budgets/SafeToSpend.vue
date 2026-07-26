<script setup lang="ts">
import type { BudgetId } from '~/components/budgets/types'
import type { SafeToSpendBreakdown } from '~/components/budgets/useBudgetProgress'

import { useBudgetsStore } from '~/components/budgets/useBudgetsStore'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { formatByLocale } from '~~/utils/date/civil'

const props = defineProps<{
  breakdown: SafeToSpendBreakdown
  payday: { amountBase: number, dayEpoch: number } | null
  perDay: number | null
  periodEnd: number
  periodLabel: string
}>()

const emit = defineEmits<{
  closed: []
}>()

const { locale, t } = useI18n()
const budgetsStore = useBudgetsStore()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()

const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')

function name(budgetId: BudgetId) {
  const catId = budgetsStore.items?.[budgetId]?.categoryId
  return (catId && categoriesStore.items?.[catId]?.name) || catId || budgetId
}

// Only budgets with still-unrealized bills belong in the "upcoming bills" group.
const billRows = computed(() => props.breakdown.rows.filter(r => r.committed > 0))
</script>

<template>
  <BottomSheetModal @closed="emit('closed')">
    <template #default>
      <UiTitleModal>
        {{ t('budgets.hero.safeToSpend') }} · {{ props.periodLabel }}
      </UiTitleModal>

      <div class="bottomSheetContentInside scrollerBlock grid content-start gap-3 px-3 py-2">
        <div class="grid gap-1">
          <div class="text-2xs flex items-center justify-between">
            <span class="text-muted">{{ t('budgets.safeSheet.leftIn') }}</span>
            <Amount
              :amount="props.breakdown.available"
              :currencyCode="currenciesStore.base"
              :isShowBaseRate="false"
              align="left"
              variant="xs"
            />
          </div>
          <div
            v-for="row in props.breakdown.rows"
            :key="row.budgetId"
            class="text-2xs flex items-center justify-between pl-2"
          >
            <span class="text-muted">{{ name(row.budgetId) }}</span>
            <Amount
              :amount="row.available"
              :class="{ 'text-expense-1!': row.available < 0 }"
              :currencyCode="currenciesStore.base"
              :isShowBaseRate="false"
              align="left"
              variant="xs"
            />
          </div>
        </div>

        <div v-if="props.breakdown.committedBudgeted > 0" class="grid gap-1">
          <div class="text-2xs flex items-center justify-between">
            <span class="text-muted">{{ t('budgets.safeSheet.billsIn') }}</span>
            <Amount
              :amount="-props.breakdown.committedBudgeted"
              :currencyCode="currenciesStore.base"
              :isShowBaseRate="false"
              align="left"
              variant="xs"
            />
          </div>
          <div
            v-for="row in billRows"
            :key="row.budgetId"
            class="text-2xs flex items-center justify-between pl-2"
          >
            <span class="text-muted">{{ name(row.budgetId) }}</span>
            <Amount
              :amount="-row.committed"
              :currencyCode="currenciesStore.base"
              :isShowBaseRate="false"
              align="left"
              variant="xs"
            />
          </div>
        </div>

        <div v-if="props.breakdown.committedUnbudgeted > 0" class="text-2xs flex items-center justify-between">
          <span class="text-muted">{{ t('budgets.safeSheet.billsOut') }}</span>
          <Amount
            :amount="-props.breakdown.committedUnbudgeted"
            :currencyCode="currenciesStore.base"
            :isShowBaseRate="false"
            align="left"
            variant="xs"
          />
        </div>

        <div class="border-default flex items-center justify-between border-t pt-2 text-sm">
          <span>{{ t('budgets.hero.safeToSpend') }}</span>
          <Amount
            :amount="props.breakdown.total"
            :class="{
              'text-income-1!': props.breakdown.total > 0,
              'text-expense-1!': props.breakdown.total < 0,
            }"
            :currencyCode="currenciesStore.base"
            :isShowBaseRate="false"
            align="left"
            variant="sm"
          />
        </div>

        <div class="text-2xs text-muted grid gap-1">
          <div>{{ t('budgets.safeSheet.caption', { period: props.periodLabel }) }}</div>
          <div v-if="props.perDay != null">
            {{ t('budgets.safeSheet.perDay', { amount: Math.round(props.perDay) }) }} · {{ t('budgets.safeSheet.untilDate', { date: formatByLocale(props.periodEnd, 'd MMM', dateLocale) }) }}
          </div>
          <NuxtLink
            v-if="props.payday"
            class="hover:text-default flex items-center gap-1"
            to="/recurrences"
          >
            {{ t('budgets.safeSheet.payday', { date: formatByLocale(props.payday.dayEpoch, 'd MMM', dateLocale) }) }}
            <span>·</span>
            <Amount
              :amount="props.payday.amountBase"
              :currencyCode="currenciesStore.base"
              :isShowBaseRate="false"
              align="left"
              variant="xs"
            />
          </NuxtLink>
        </div>
      </div>
    </template>
  </BottomSheetModal>
</template>
