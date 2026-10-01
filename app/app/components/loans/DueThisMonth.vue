<script setup lang="ts">
import { formatByLocale } from '~~/utils/date/civil'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useLoansStore } from '~/components/loans/useLoansStore'

const { t } = useI18n()
const dateLocale = useDateLocale()
const loansStore = useLoansStore()
const currenciesStore = useCurrenciesStore()

const today = useCivilToday()

const due = computed(() => loansStore.dueThisMonth)
// The nearest date is the oldest unpaid row, so a past one means something is overdue.
const isOverdue = computed(() => !!due.value && due.value.nearestDate < today.value)
</script>

<template>
  <div v-if="due" class="grid gap-1 rounded-sm bg-elevated/30 px-3 py-2" data-loan-due>
    <UiText variant="caption">
      {{ t('loans.dueThisMonth') }}
    </UiText>

    <div class="flex flex-wrap items-baseline gap-x-2">
      <Amount
        :amount="due.amount"
        :currencyCode="currenciesStore.base"
        :isShowBaseRate="false"
        align="left"
        variant="summary"
      />

      <UiText variant="meta" :class="isOverdue && 'text-error!'">
        {{ t('loans.by') }} {{ formatByLocale(due.nearestDate, 'dd.MM', dateLocale) }}
      </UiText>

      <UiBadge v-if="isOverdue" tone="error" data-loan-due-overdue>
        {{ t('loans.overdue') }}
      </UiBadge>
    </div>
  </div>
</template>
