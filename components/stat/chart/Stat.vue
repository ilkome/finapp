<script setup lang="ts">
import dayjs from 'dayjs'
import type { TrnId, TrnItem } from '../trns/types'
import type { CategoryId } from '~/components/categories/types'
import { useFilter } from '~/components/filter/useFilter'
import type {
  PeriodName,
  PeriodNameWithAll,
} from '~/components/chart/useChart'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { WalletId } from '~/components/wallets/types'
import useTrns from '~/components/trns/useTrns'

const props = defineProps<{
  categoriesIds?: CategoryId[]
  walletsIds?: WalletId[]
}>()

const trnsStore = useTrnsStore()
const filterStore = useFilter()
const { getStoreTrnsIds } = useTrns()

const trnsIds = computed(() =>
  getStoreTrnsIds({
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
  getStoreTrnsIds({
    date: date.value,
    periodName: period.value,
    categoriesIds: props.categoriesIds,
    walletsIds: props.walletsIds,
  }),
)

// Date Selector
const { isShowDateSelector, openDateSelector, closeDateSelector } = useDateSelector()

function useDateSelector() {
  const isShowDateSelector = ref(false)

  function openDateSelector() {
    isShowDateSelector.value = true
  }
  function closeDateSelector() {
    isShowDateSelector.value = false
  }

  return {
    isShowDateSelector,
    openDateSelector,
    closeDateSelector,
  }
}

provide('date', date)
provide('isShowDateSelector', isShowDateSelector)
provide('closeDateSelector', closeDateSelector)
provide('openDateSelector', openDateSelector)

provide('period', period)
provide('periodWithoutAll', periodWithoutAll)
provide('setNextPeriodDate', setNextPeriodDate)
provide('setPeriodAndDate', setPeriodAndDate)
provide('setPrevPeriodDate', setPrevPeriodDate)
provide('setDate', setDate)
</script>

<template>
  <div class="flex flex-col gap-1">
    <StatDate />
    <StatChartWrap :trnsIds="trnsIds" />
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
