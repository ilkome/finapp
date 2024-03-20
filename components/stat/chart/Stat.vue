<script setup lang="ts">
import dayjs from 'dayjs'
import { moneyTypes } from '~/components/stat/types'
import type { MoneyTypeNumber, MoneyTypeSlugSum } from '~/components/stat/types'
import type { CategoryId } from '~/components/categories/types'
import type { PeriodName, PeriodNameWithAll } from '~/components/stat/chart/useChartStore'
import type { TrnId, TrnItem } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'
import { useFilter } from '~/components/filter/useFilter'
import { useStat } from '~/components/stat/useStatStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  categoriesIds?: CategoryId[]
  walletsIds?: WalletId[]
}>()

const trnsStore = useTrnsStore()
const filterStore = useFilter()
const statStore = useStat()

function getMoneyTypeNumber(slug: MoneyTypeSlugSum): MoneyTypeNumber {
  return moneyTypes.find(t => t.id === `${slug}`.toLowerCase())?.type || 3
}

function getAmount(slug: MoneyTypeSlugSum) {
  if (slug === 'sum')
    return statStore.statCurrentPeriod.income.total - statStore.statCurrentPeriod.expense.total

  return statStore.statCurrentPeriod[slug].total
}

function getColorizeType(slug: MoneyTypeSlugSum) {
  if (slug === 'sum') {
    return statStore.statCurrentPeriod.income.total - statStore.statCurrentPeriod.expense.total > 0
      ? 'income'
      : 'expense'
  }
  return slug
}

function isItShownAverage(slug: MoneyTypeSlugSum) {
  if (slug === 'sum')
    return statStore.statAverage?.sum !== 0
  return statStore.statAverage[slug] !== 0
}

function getAverageAmount(slug: MoneyTypeSlugSum) {
  if (slug === 'sum')
    return statStore.statAverage?.sum
  return statStore.statAverage[slug]
}

function getAverageItem(slug: MoneyTypeSlugSum) {
  return {
    amount: getAmount(slug),
    averageAmount: getAverageAmount(slug),
    colorizeType: getColorizeType(slug),
    isShownAverage: isItShownAverage(slug),
    moneyTypeNumber: getMoneyTypeNumber(slug),
    moneyTypeSlugSum: slug,
  }
}

const averages = computed(() => {
  const averageSlugs = ['income', 'expense', 'sum'] as const

  return averageSlugs.reduce((acc, slug) => {
    acc[slug] = getAverageItem(slug)
    return acc
  }, {} as Record<MoneyTypeSlugSum, ReturnType<typeof getAverageItem>>)
})

const trnsIds = computed(() =>
  trnsStore.getStoreTrnsIds({
    categoriesIds: props.categoriesIds,
    walletsIds: props.walletsIds,
  }),
)

function usePeriodDate(trnsIds: Ref<TrnId[]>) {
  const { getNextPeriodDate, getPrevPeriodDate } = usePeriodUtils()

  const date = ref<number>(
    dayjs(filterStore.date).startOf(filterStore.periodWithoutAll).valueOf(),
  )

  function setDate(value: number) {
    date.value = value
  }

  const period = ref<PeriodNameWithAll>(filterStore.period)
  const periodWithoutAll = computed<PeriodName>(() =>
    period.value === 'all' ? 'year' : period.value,
  )

  function setPeriodAndDate(value: PeriodNameWithAll) {
    period.value = value
  }

  function setNextPeriodDate() {
    const newDate = getNextPeriodDate({
      date: date.value,
      period: period.value,
      trnsIds: trnsIds.value,
    })
    if (newDate)
      date.value = newDate
  }

  function setPrevPeriodDate() {
    const newDate = getPrevPeriodDate({
      date: date.value,
      period: period.value,
      trnsIds: trnsIds.value,
    })
    if (newDate)
      date.value = newDate
  }

  return {
    date,
    setDate,
    setPeriodAndDate,
    setNextPeriodDate,
    setPrevPeriodDate,

    period,
    periodWithoutAll,
  }
}

const {
  date,
  period,
  setDate,
  periodWithoutAll,
  setPeriodAndDate,
  setPrevPeriodDate,
  setNextPeriodDate,
} = usePeriodDate(trnsIds)

const periodTrnsIds = computed(() =>
  trnsStore.getStoreTrnsIds({
    date: date.value,
    periodName: period.value,
    categoriesIds: props.categoriesIds,
    walletsIds: props.walletsIds,
  }),
)

provide('date', date)
provide('period', period)
provide('periodWithoutAll', periodWithoutAll)
provide('setNextPeriodDate', setNextPeriodDate)
provide('setPeriodAndDate', setPeriodAndDate)
provide('setPrevPeriodDate', setPrevPeriodDate)
provide('setDate', setDate)

function usePeriodUtils() {
  function getNextPeriodDate({
    date,
    period,
    trnsIds,
  }: {
    date: number
    period: PeriodNameWithAll
    trnsIds: TrnId[]
  }) {
    if (period === 'all' || trnsIds.length === 0)
      return

    const oldestTrn: TrnItem = trnsStore.items[trnsIds.at(-1) as TrnId]
    if (!oldestTrn)
      return

    const oldestDate = dayjs(oldestTrn.date).startOf(period).valueOf()

    const nextDate = dayjs(date).subtract(1, period).startOf(period).valueOf()

    if (nextDate >= oldestDate)
      return nextDate
  }

  function getPrevPeriodDate({
    date,
    period,
    trnsIds,
  }: {
    date: number
    period: PeriodNameWithAll
    trnsIds: TrnId[]
  }) {
    if (period === 'all' || trnsIds.length === 0)
      return

    const nextDate = dayjs(date).add(1, period).startOf(period).valueOf()

    if (nextDate <= dayjs().valueOf())
      return nextDate
  }

  return {
    getNextPeriodDate,
    getPrevPeriodDate,
  }
}
</script>

<template>
  <div class="flex items-center justify-between gap-2 px-2">
    <StatDateNav />
    <StatDateView />
    <CurrenciesChangeBtn />
  </div>

  <!-- Sum All -->
  <div class="mx-2 mb-2 rounded-xl bg-item-4">
    <div
      class="flex flex-wrap items-center gap-3 gap-x-6 rounded-lg bg-item-4 p-2 sm_justify-start sm_bg-transparent sm_p-3 sm_pt-4"
    >
      <StatTotalWithAverage2
        v-for="(item, slug) in averages"
        :key="slug"
        :item="item"
      />
    </div>

    <LazyStatChartWrap
      :trnsIds
    />
  </div>

  <div class="px-2">
    <div class="pb-4">
      <UiTitle>
        <div class="flex gap-2">
          Всего транзакций: {{ trnsIds?.length }}
        </div>
      </UiTitle>
    </div>

    <TrnsListWithControl :trnsIds="periodTrnsIds" />
  </div>
</template>
