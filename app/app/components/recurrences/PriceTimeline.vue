<script setup lang="ts">
import type { RecurrenceItem } from '~/components/recurrences/types'

import { formatByLocale } from '~~/utils/date/civil'
import { priceHistoryTimeline } from '~/components/recurrences/occurrences'
import { TrnType } from '~/components/trns/types'

const props = defineProps<{
  currency: string
  // When set, price-change rows become editable: tap the date to correct it, or remove the change.
  editable?: boolean
  rule: RecurrenceItem
  type: TrnType
}>()

const emit = defineEmits<{
  edit: [from: number]
  remove: [from: number]
}>()

const { locale, t } = useI18n()
const dateLocale = computed(() => locale.value.startsWith('ru') ? 'ru' : 'en')

// The engine returns ascending by date; show newest first.
const rows = computed(() => [...priceHistoryTimeline(props.rule)].reverse())
// The earliest entry is the base (anchor) price, not a change - it stays read-only.
const baseFrom = computed(() => rows.value.length ? Math.min(...rows.value.map(r => r.from)) : 0)

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
      class="flex items-center justify-between text-2xs"
      :class="i === 0 ? 'text-highlighted' : 'text-muted'"
    >
      <button
        v-if="editable && r.from !== baseFrom"
        type="button"
        class="flex items-center gap-1 rounded text-highlighted underline decoration-dotted underline-offset-2"
        @click="emit('edit', r.from)"
      >
        <Icon name="lucide:pencil" size="11" />
        {{ t('recurrences.form.priceFrom') }} {{ formatByLocale(r.from, 'd MMM yyyy', dateLocale) }}
      </button>
      <span v-else>{{ t('recurrences.form.priceFrom') }} {{ formatByLocale(r.from, 'd MMM yyyy', dateLocale) }}</span>
      <div class="flex items-center gap-1.5">
        <span
          v-if="r.deltaPct != null"
          class="rounded-full px-1.5 text-2xs"
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
        <button
          v-if="editable && r.from !== baseFrom"
          type="button"
          class="text-muted hover:text-expense-1"
          :aria-label="t('base.delete')"
          @click="emit('remove', r.from)"
        >
          <Icon name="lucide:x" size="13" />
        </button>
      </div>
    </div>
  </div>
</template>
