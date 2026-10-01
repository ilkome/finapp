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

    <UiText variant="meta" :class="isOverdue && 'text-error'">
      {{ formatByLocale(due.nearestDate, 'dd.MM', dateLocale) }}
    </UiText>

    <UiBadge
      v-if="isOverdue"
      tone="error"
      data-loan-due-overdue
    >
      {{ t('loans.overdue') }}
    </UiBadge>
  </div>
</template>
