<script setup lang="ts">
import { formatByLocale } from '~~/utils/date/civil'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useLoansStore } from '~/components/loans/useLoansStore'

const { t } = useI18n()
const dateLocale = useDateLocale()
const loansStore = useLoansStore()
const currenciesStore = useCurrenciesStore()

const today = useCivilToday()

// The nearest date is the oldest unpaid row, so a past one means something is overdue.
const isOverdue = computed(() => !!loansStore.dueThisMonth && loansStore.dueThisMonth.nearestDate < today.value)
</script>

<template>
  <NuxtLink v-if="loansStore.dueThisMonth" to="/loans" class="grid gap-1 rounded-sm interactive bg-elevated/30 px-3 py-2" data-loan-due>
    <UiText variant="caption">
      {{ t('loans.dueThisMonth') }}
    </UiText>

    <div class="flex flex-wrap items-baseline gap-x-2">
      <Amount
        :amount="loansStore.dueThisMonth.amount"
        :currencyCode="currenciesStore.base"
        :isShowBaseRate="false"
        align="left"
        variant="summary"
      />

      <UiText variant="meta" :class="isOverdue && 'text-error!'">
        {{ t('loans.by') }} {{ formatByLocale(loansStore.dueThisMonth.nearestDate, 'dd.MM', dateLocale) }}
      </UiText>

      <UBadge v-if="isOverdue" color="error" variant="soft" size="sm" data-loan-due-overdue>
        {{ t('loans.overdue') }}
      </UBadge>
    </div>
  </NuxtLink>
</template>
