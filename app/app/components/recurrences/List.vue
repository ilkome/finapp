<script setup lang="ts">
import { addCivilDays, todayCivilDayEpoch } from '~~/utils/date/civil'

import type { RecurrenceId, RecurrenceItem, RecurrenceStatus } from '~/components/recurrences/types'

import { getAmountInRate } from '~/components/amount/getTotal'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { committedNativeInRange, nextOccurrence } from '~/components/recurrences/occurrences'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { sortMode = 'date' } = defineProps<{
  sortMode?: 'cost' | 'date'
}>()

const emit = defineEmits<{
  edit: [id: RecurrenceId]
}>()

const { t } = useI18n()
const recurrencesStore = useRecurrencesStore()
const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()

const order: RecurrenceStatus[] = ['active', 'paused', 'cancelled']

// Committed cost over the next 365 civil days, in base currency - the ranking key for "biggest".
// Priced per occurrence so the sort agrees with the totals card when a price change is scheduled.
function annualBaseCost(rule: RecurrenceItem): number {
  const start = todayCivilDayEpoch()
  const native = committedNativeInRange(rule, { end: addCivilDays(start, 365), start })
  if (!native)
    return 0
  const currency = walletsStore.items?.[rule.walletId]?.currency ?? currenciesStore.base
  return getAmountInRate({
    amount: native,
    baseCurrencyCode: currenciesStore.base,
    currencyCode: currency,
    rates: currenciesStore.rates,
  })
}

const groups = computed(() => {
  const buckets: Record<RecurrenceStatus, { id: string, rule: RecurrenceItem }[]> = {
    active: [],
    cancelled: [],
    paused: [],
  }
  const items = recurrencesStore.items ?? {}
  for (const [id, rule] of Object.entries(items))
    buckets[rule.status].push({ id, rule })

  const today = todayCivilDayEpoch()
  for (const status of order) {
    buckets[status].sort((a, b) => {
      if (sortMode === 'cost')
        return annualBaseCost(b.rule) - annualBaseCost(a.rule)
      // By next charge date, soonest first; rules with no upcoming charge sink to the bottom.
      return (nextOccurrence(a.rule, today) ?? Number.POSITIVE_INFINITY)
        - (nextOccurrence(b.rule, today) ?? Number.POSITIVE_INFINITY)
    })
  }
  return buckets
})
</script>

<template>
  <div class="grid gap-4">
    <div v-for="status in order" :key="status">
      <template v-if="groups[status].length">
        <UiTextSubtitle class="mb-1 px-1 tracking-wide uppercase">
          {{ t(`recurrences.status.${status}`) }} ({{ groups[status].length }})
        </UiTextSubtitle>
        <div class="grid gap-1">
          <RecurrencesItem
            v-for="entry in groups[status]"
            :id="entry.id"
            :key="entry.id"
            :rule="entry.rule"
            @edit="emit('edit', $event)"
          />
        </div>
      </template>
    </div>
  </div>
</template>
