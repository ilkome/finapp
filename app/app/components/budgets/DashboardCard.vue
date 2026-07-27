<script setup lang="ts">
import { useBudgetPeriod } from '~/components/budgets/useBudgetPeriod'
import { useBudgetProgress } from '~/components/budgets/useBudgetProgress'
import { useBudgetsStore } from '~/components/budgets/useBudgetsStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'

const { t } = useI18n()
const budgetsStore = useBudgetsStore()
const currenciesStore = useCurrenciesStore()

// Uses the same global period as the /budgets page (shared persisted periodType).
const period = useBudgetPeriod()
const { safeToSpendTotal } = useBudgetProgress(period)
</script>

<template>
  <NuxtLink
    v-if="budgetsStore.hasItems"
    to="/budgets"
    class="flex items-center justify-between gap-3 rounded-md bg-elevated px-4 py-3 hover:bg-elevated/70"
  >
    <div>
      <div class="text-2xs tracking-wide text-muted uppercase">
        {{ t('budgets.title') }} · {{ t('budgets.hero.safeToSpend') }}
      </div>
      <Amount
        :amount="safeToSpendTotal"
        :colorize="safeToSpendTotal < 0 ? 'expense' : 'income'"
        :currencyCode="currenciesStore.base"
        :isShowBaseRate="false"
        align="left"
        variant="base"
      />
    </div>
    <Icon name="lucide:chevron-right" size="18" class="text-muted" />
  </NuxtLink>
</template>
