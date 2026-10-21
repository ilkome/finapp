<script setup lang="ts">
import { formatByLocale } from '~~/utils/date/civil'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useLoansStore } from '~/components/loans/useLoansStore'

const { t } = useI18n()
const dateLocale = useDateLocale()
const loansStore = useLoansStore()
const currenciesStore = useCurrenciesStore()

const today = useCivilToday()

// With this month paid off, the card pair looks one month further ahead.
const blocks = computed(() => {
  const { afterNextMonth, nextMonth, thisMonth } = loansStore.dueByMonth
  const months = [
    { due: thisMonth, key: 'this', title: t('loans.dueThisMonth') },
    { due: nextMonth, key: 'next', title: t('loans.dueNextMonth') },
    { due: afterNextMonth, key: 'afterNext', title: t('loans.dueAfterNextMonth') },
  ]
  return thisMonth ? months.slice(0, 2) : months.slice(1)
})
const shown = computed(() => blocks.value.flatMap(block => block.due ? [{ ...block, due: block.due }] : []))
const openKey = ref<string | null>(null)
const opened = computed(() => shown.value.find(block => block.key === openKey.value))
</script>

<template>
  <UiTileGrid v-if="shown.length">
    <WalletsPageLinkCard
      v-for="{ due, key, title } in shown"
      :key
      class="h-full"
      :title
      :data-loan-due="key"
      @click="openKey = key"
    >
      <div class="flex flex-wrap items-baseline gap-x-2">
        <Amount
          :amount="due.noInterestAmount"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          align="left"
          variant="summary"
        />

        <UiText variant="meta" :class="due.nearestDate < today && 'text-error!'">
          {{ t('loans.by') }} {{ formatByLocale(due.nearestDate, 'dd.MM', dateLocale) }}
        </UiText>

        <UBadge v-if="due.nearestDate < today" color="error" variant="soft" size="sm" data-loan-due-overdue>
          {{ t('loans.overdue') }}
        </UBadge>
      </div>
    </WalletsPageLinkCard>

    <LoansDueSheet
      v-if="opened"
      :due="opened.due"
      :title="opened.title"
      @closed="openKey = null"
    />
  </UiTileGrid>
</template>
