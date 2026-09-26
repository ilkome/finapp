<script setup lang="ts">
import { formatByLocale } from '~~/utils/date/civil'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useLoansStore } from '~/components/loans/useLoansStore'

const { t } = useI18n()
const dateLocale = useDateLocale()
const loansStore = useLoansStore()
const currenciesStore = useCurrenciesStore()

const due = computed(() => loansStore.dueThisMonth)
</script>

<template>
  <div v-if="due" class="flex items-center gap-2 px-2 py-1" data-loan-due>
    <UiText variant="meta">
      {{ t('loans.dueThisMonth') }}
    </UiText>

    <Amount
      :amount="due.amount"
      :currencyCode="currenciesStore.base"
      :isShowBaseRate="false"
      align="left"
      variant="secondary"
    />

    <UiText variant="meta">
      {{ formatByLocale(due.nearestDate, 'dd.MM', dateLocale) }}
    </UiText>
  </div>
</template>
