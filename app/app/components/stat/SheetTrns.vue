<script setup lang="ts">
import type { StatReportContext } from '~/components/stat/report/types'
import type { TrnId } from '~/components/trns/types'

import { useAmount } from '~/components/amount/useAmount'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { takeGroupRows } from '~/components/stat/sheetTrnsChunk'
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

// Rows mount in chunks: every period at once is most of the sheet's DOM and stalls its opening frame.
// The sentinel remounts with each chunk, so a fresh observation reports it again while it is still near.
const ROWS_CHUNK = 40
const rowsBudget = ref(ROWS_CHUNK)
const shownGroups = computed(() => takeGroupRows(groups.value, rowsBudget.value))
const hasMore = computed(() => groups.value.reduce((sum, group) => sum + group.ids.length, 0) > rowsBudget.value)
// Another period, category or filter starts from the top; an edited row does not.
watch(() => groups.value.map(group => group.key).join(), () => rowsBudget.value = ROWS_CHUNK)

const sentinel = useTemplateRef<HTMLElement>('sentinel')
// The margin reaches a screen ahead only against the drawer's own scroller: the viewport would see
// the sentinel already clipped by it. A dialog on wider screens observes against the viewport.
const scroller = computed(() => sentinel.value?.closest<HTMLElement>('.drawer-body') ?? undefined)
useIntersectionObserver(sentinel, ([entry]) => {
  if (entry?.isIntersecting)
    rowsBudget.value += ROWS_CHUNK
}, { root: scroller, rootMargin: '0px 0px 100% 0px' })
</script>

<template>
  <div class="grid gap-3 pt-2">
    <section v-for="group in shownGroups" :key="group.key" data-stat-sheet-period>
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
    <div v-if="hasMore" :key="rowsBudget" ref="sentinel" class="h-px" />
  </div>
</template>
