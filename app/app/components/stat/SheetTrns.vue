<script setup lang="ts">
import type { StatReportContext } from '~/components/stat/report/types'
import type { TrnId } from '~/components/trns/types'

import { useAmount } from '~/components/amount/useAmount'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useDateFormats } from '~/composables/useDateFormats'

/**
 * The transactions of a stat sheet: one heading per chart period (the transactions' date heading, the period's first day), the rows under it plain and tight with a
 * small date on the left. The category is named only when the sheet's category has children to tell apart.
 */
const props = defineProps<{
  ctx: StatReportContext
  selectedTrnsIds: TrnId[]
}>()

const trnsStore = useTrnsStore()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const { computeTotalForTrnsIds } = useAmount()
const { formatDate } = useDateFormats()

const isShowCategory = computed(() => {
  const categoryId = props.ctx.params.categoryId?.value
  return !categoryId || categoriesStore.getChildrenIds(categoryId).length > 0
})

const groups = computed(() => {
  const selected = new Set(props.selectedTrnsIds)
  const dateOf = (id: TrnId) => trnsStore.items?.[id]?.date ?? 0
  return props.ctx.effectiveIntervals.value
    .map((interval) => {
      const ids = interval.trnsIds.filter(id => selected.has(id)).toSorted((a, b) => dateOf(b) - dateOf(a))
      return {
        date: interval.range.start,
        ids,
        key: interval.range.start,
        sum: computeTotalForTrnsIds(ids),
      }
    })
    .filter(group => group.ids.length)
    .toReversed()
})
</script>

<template>
  <div class="grid gap-3 pt-2">
    <section v-for="group in groups" :key="group.key" data-stat-sheet-period>
      <TrnsDateRowView
        :currencyCode="currenciesStore.base"
        :date="group.date"
        :sum="group.sum"
        isShowGroupSum
      />

      <TrnsItemWrap
        v-for="id in group.ids"
        :key="id"
        compact
        class="group"
        :date="(formatDate(trnsStore.items![id]!.date, 'trnItem') as string)"
        :isShowCategory
        :trnId="id"
        :trnItem="trnsStore.computeTrnItem(id)!"
      />
    </section>
  </div>
</template>
