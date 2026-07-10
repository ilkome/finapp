<script setup lang="ts">
import type { RecurrenceItem } from '~/components/recurrences/types'

import { formatByLocale } from '~/components/date/utils'
import { priceHistoryTimeline } from '~/components/recurrences/occurrences'
import { TrnType } from '~/components/trns/types'

const props = defineProps<{
  currency: string
  rule: RecurrenceItem
  type: TrnType
}>()

const { locale, t } = useI18n()
const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')

// The engine returns ascending by date; show newest first.
const rows = computed(() => [...priceHistoryTimeline(props.rule)].reverse())

// A price rise is "bad" (red) for an expense but "good" (green) for income - invert by type.
function deltaClass(deltaPct: number) {
  const isBad = props.type === TrnType.Income ? deltaPct < 0 : deltaPct > 0
  return isBad ? 'text-expense-1 bg-expense-1/10' : 'text-income-1 bg-income-1/10'
}
</script>

<template>
  <div class="grid gap-1">
    <div
      v-for="(r, i) in rows"
      :key="r.from"
      class="text-2xs flex items-center justify-between"
      :class="i === 0 ? 'text-highlighted' : 'text-muted'"
    >
      <span>{{ t('recurrences.form.priceFrom') }} {{ formatByLocale(r.from, 'd MMM yyyy', dateLocale) }}</span>
      <div class="flex items-center gap-1.5">
        <span
          v-if="r.deltaPct != null"
          class="text-2xs rounded-full px-1.5"
          :class="deltaClass(r.deltaPct)"
        >
          {{ r.deltaPct > 0 ? '+' : '' }}{{ Math.round(r.deltaPct * 100) }}%
        </span>
        <Amount
          :amount="r.amount"
          :currencyCode="currency"
          :isShowBaseRate="false"
          :type="type"
          variant="sm"
        />
      </div>
    </div>
  </div>
</template>
