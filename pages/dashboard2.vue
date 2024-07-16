<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useFilter } from '~/components/filter/useFilter'
import { useStat } from '~/components/stat/useStat'
import type { MoneyTypeSlugNew } from '~/components/stat/types'
import useAmount from '~/components/amount/useAmount'
import { useNewStat } from '~/components/stat/useNewStat'
import { useDateRange } from '~/components/date/useDateRange'

const props = defineProps<{
  categoriesIds?: CategoryId[]
  isShowFilter?: boolean
  isShowTotals?: boolean
  storageKey?: string
  walletsIds?: WalletId[]
}>()

const filter = useFilter()
const stat = useStat(filter)

filter.initChart()

provide('stat', stat)
provide('filter', filter)

const { t } = useI18n()
const trnsStore = useTrnsStore()

useHead({
  title: t('stat.title'),
})

definePageMeta({
  keepalive: true,
})

const trnsIds = computed(() =>
  trnsStore.getStoreTrnsIds({
    categoriesIds: props.categoriesIds,
    walletsIds: props.walletsIds,
  }, {
    includesChildCategories: true,
  }),
)

const { date, duration, groupBy, initialRange, period, range, setRange, setRangeByCalendar, setRangeByPeriod } = useDateRange()

const periodTrnsIds = computed(() =>
  groupBy.value === 'all'
    ? trnsStore.getStoreTrnsIds(
      {
        categoriesIds: [],
        trnsIds: trnsIds.value,
      },
      { includesChildCategories: false },
    )
    : trnsStore.getStoreTrnsIds(
      {
        categoriesIds: [],
        dates: {
          from: range.value.start,
          until: range.value.end,
        },
        trnsIds: trnsIds.value,
      },
      { includesChildCategories: false },
    ),
)

const { getTotalOfTrnsIds } = useAmount()
const netTab = useStorage<MoneyTypeSlugNew>(`${props.storageKey}-netTab`, 'expense')
const totals = computed(() => getTotalOfTrnsIds(periodTrnsIds.value))

const expenseTrnsIds = computed(() =>
  periodTrnsIds.value.filter(
    trnId => trnsStore.items[trnId]!.type === 0,
  ).sort(
    (a, b) => trnsStore.items[b]!.date - trnsStore.items[a]!.date,
  ),
)

const incomeTrnsIds = computed(() =>
  periodTrnsIds.value.filter(
    trnId => trnsStore.items[trnId]!.type === 1,
  ).sort(
    (a, b) => trnsStore.items[b]!.date - trnsStore.items[a]!.date,
  ),
)

const selectedTrnsIds = computed(() => {
  if (netTab.value === 'income')
    return incomeTrnsIds.value
  if (netTab.value === 'expense')
    return expenseTrnsIds.value

  return periodTrnsIds.value
})

const { getCats } = useNewStat()
</script>

<template>
  <div class="grid h-full grid-rows-[auto,1fr] overflow-hidden">
    <div class="sticky top-0 z-10 grid gap-3 bg-item-9 px-3 py-2">
      <DateContent
        :groupBy
        :range
        :period
        :date
        :duration
        :initialRange
        :maxRange="trnsStore.getRange(trnsIds)"
        @setRange="setRange"
        @setRangeByCalendar="setRangeByCalendar"
        @setRangeByPeriod="setRangeByPeriod"
      />
    </div>

    <div class="grid h-full content-start overflow-y-auto pb-14 pt-3 px-3">
      <div class="grid gap-4">
        <div class="w-full overflow-hidden overflow-y-auto">
          <div class="flex justify-stretch flex-wrap bg-item-4 -rounded-lg -[contain:paint]">
            <StatSum3
              :amount="totals.sum"
              :class="{
                'bg-item-5': netTab === 'sum',
              }"
              class="p-3 flex-grow"
              isTotal
              type="sum"
              @click="netTab = 'sum'"
            />
            <StatSum3
              :amount="totals.expense"
              :class="{
                'bg-item-5': netTab === 'expense',
              }"
              class="p-3 flex-grow"
              isTotal
              type="expense"
              @click="netTab = 'expense'"
            />
            <StatSum3
              :amount="totals.income"
              :class="{
                'bg-item-5': netTab === 'income',
              }"
              class="p-3 flex-grow"
              isTotal
              type="income"
              @click="netTab = 'income'"
            />
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-2 gap-y-12 sm:gap-12 lg:gap-24 -max-w-md">
          <div>
            <StatLinesItemLine
              v-for="insideItem in getCats(selectedTrnsIds, true)"
              :key="insideItem.id"
              :item="insideItem"
              :isShowLinesChart="false"
              :isActive="false"
              :biggestCatNumber="1000"
            />
          </div>

          <TrnsList
            :trnsIds="selectedTrnsIds"
            :size="5"
            isShowFilterByDesc
            isShowGroupSum
            isShowHeader2
          />
        </div>
      </div>
    </div>
  </div>
</template>
