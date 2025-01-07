<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { differenceInDays, differenceInMonths, differenceInWeeks } from 'date-fns'

import type { CategoryId } from '~/components/categories/types'
import type { Range, StatDateProvider } from '~/components/date/types'
import type { FilterProvider } from '~/components/filter/types'
import type { ChartSeries, IntervalData, MoneyTypeSlugNew } from '~/components/stat/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import useAmount from '~/components/amount/useAmount'
import StatCategoriesSection from '~/components/stat/categories/Section.vue'
import { useStatChart } from '~/components/stat/chart/useStatChart'
import StatTrnsSection from '~/components/stat/trns/Section.vue'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  hasChildren?: boolean
  isOneCategory?: boolean
  isQuickModal?: boolean
  preCategoriesIds?: CategoryId[]
  storageKey: string
  trnsIds: TrnId[]
  type: MoneyTypeSlugNew
  walletId?: WalletId
}>()

const { t } = useI18n()
const route = useRoute()
const filter = inject('filter') as FilterProvider
const statDate = inject('statDate') as StatDateProvider
const statConfig = inject('statConfig') as StatConfigProvider

const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()
const { addMarkArea, createSeriesItem } = useStatChart()

const isShowTrns = ref(false)
const newBaseStorageKey = computed(() => `finapp-${statDate.params.value.intervalsBy}-${props.storageKey}-${JSON.stringify(filter?.categoriesIds?.value)}`)
const selectedType = useStorage<MoneyTypeSlugNew>(`selectedType-${props.type}-${newBaseStorageKey.value}`, 'summary')

const selectedTypesMapping = computed(() => {
  const typeMapping = {
    expense: [0, 2],
    income: [1, 2],
    summary: [0, 1, 2],
  } as const

  const trnsTypes = typeMapping[props.type !== 'netIncome' ? props.type : selectedType.value]

  if (trnsTypes) {
    return trnsTypes
  }

  return undefined
})

const statTypeShow = computed(() => ({
  expense: props.trnsIds.some(id => trnsStore.items?.[id]?.type === 0),
  income: props.trnsIds.some(id => trnsStore.items?.[id]?.type === 1),
}))

const isPeriodOneDay = computed(() => (statDate.params.value.rangeBy === 'day' && statDate.params.value.rangeDuration === 1) || (statDate.params.value.intervalsBy === 'day' && statDate.params.value.intervalSelected !== -1))

const rangeTrnsIds = computed(() => {
  const params = {
    trnsIds: props.trnsIds,
  }

  return trnsStore.getStoreTrnsIds(params, { includesChildCategories: false })
})

const intervalsData = computed(() => getIntervalsData(rangeTrnsIds.value, statDate.intervalsInRange.value))

const selectedTrnsIds = computed(() => {
  if (!selectedTypesMapping.value) {
    return rangeTrnsIds.value
  }

  return trnsStore.getStoreTrnsIds({
    trnsIds: statDate.params.value.intervalSelected !== -1
      ? intervalsData.value[statDate.params.value.intervalSelected]?.trnsIds
      : rangeTrnsIds.value,
    trnsTypes: selectedTypesMapping.value,
  }, { includesChildCategories: false })
})

const rangeTotal = computed(() => {
  const trnsIds = statDate.params.value.intervalSelected !== -1
    ? intervalsData.value[statDate.params.value.intervalSelected]?.trnsIds
    : rangeTrnsIds.value

  return getTotalOfTrnsIds(trnsIds)
})

const averageTotal = computed(() => {
  if (differenceInDays(statDate.range.value.end, statDate.range.value.start) < 2)
    return

  const sum = selectedType.value === 'netIncome' ? rangeTotal.value.sum : rangeTotal.value[props.type]

  const date = statDate.params.value.intervalSelected !== -1
    ? statDate.selectedInterval.value
    : statDate.range.value

  const dif = {
    day: differenceInDays(date.end, date.start) + 1,
    month: differenceInMonths(date.end, date.start) + 1,
    week: differenceInWeeks(date.end, date.start) + 1,
  }

  const items = {
    month: 0,
    // eslint-disable-next-line perfectionist/sort-objects
    week: 0,
    // eslint-disable-next-line perfectionist/sort-objects
    day: 0,
  }

  if (dif.month > 1)
    items.month = sum / dif.month

  if (dif.day > 1)
    items.day = sum / dif.day

  if (dif.week > 1)
    items.week = sum / dif.week

  return Object.fromEntries(Object.entries(items).filter(([_, value]) => value !== 0))
})

const chart = {
  series: computed<ChartSeries[]>(() => {
    const intervalsChartData = getIntervalsData(rangeTrnsIds.value, statDate.intervalsInRange.value)
    const transactionTypes = {
      hasExpense: rangeTrnsIds.value.some(id => trnsStore.items?.[id]?.type === 0),
      hasIncome: rangeTrnsIds.value.some(id => trnsStore.items?.[id]?.type === 1),
    }

    const typesToShow = props.type === 'netIncome'
      ? [
          ...(transactionTypes.hasIncome ? ['income'] : []),
          ...(transactionTypes.hasExpense ? ['expense'] : []),
        ] as MoneyTypeSlugNew[]
      : [props.type]

    const intervalTotals = intervalsChartData.map(g => g.total)
    const baseSeries = typesToShow.map(type => createSeriesItem(type, intervalTotals, statConfig.config.value.chart.isShowAverage ? intervalsData.value.reduce((acc, i) => acc + i.total[type], 0) / (intervalsData.value.length) : false))

    const selectedInterval = intervalsChartData?.[statDate.params.value.intervalSelected]
    if (!selectedInterval?.range.start || statDate.params.value.intervalSelected < 0) {
      return baseSeries
    }

    return addMarkArea(
      baseSeries,
      selectedInterval.range.start,
      statConfig.config.value?.chartType,
    )
  }),
  xAxisLabels: computed(() => intervalsData.value.map(i => +i.range.start) ?? []),
}

function onClickCategory(categoryId: CategoryId) {
  filter.setCategoryId(categoryId)

  const baseParams = {
    filterCategories: filter?.categoriesIds?.value.join(','),
    filterWallets: props.walletId ? props.walletId : filter?.walletsIds?.value.join(','),
    storageKey: props.storageKey ?? '',
  }

  if (route.name === 'categories-id') {
    const queryParams = new URLSearchParams({
      ...baseParams,
    }).toString()
    useRouter().push(`/categories/${categoryId}?${queryParams}`)
  }
  else {
    const queryParams = new URLSearchParams({
      ...baseParams,
      ...Object.fromEntries(Object.entries(statDate.params.value)),
    }).toString()
    useRouter().push(`/stat/categories/${categoryId}?${queryParams}`)
  }
}

function onClickSumItem(type: MoneyTypeSlugNew) {
  if (type === 'summary') {
    isShowTrns.value = !isShowTrns.value
    return
  }

  selectedType.value = type === selectedType.value ? 'summary' : type
}

function getIntervalsData(trnsIds: TrnId[], intervalsInRange: Range[]) {
  return intervalsInRange.reduce((acc, range) => {
    const trnsIdsInRange = trnsIds.filter((id) => {
      const trnDate = trnsStore.items?.[id]?.date
      return trnDate! >= range.start && trnDate! <= range.end
    })

    acc.push({
      range,
      total: getTotalOfTrnsIds(trnsIdsInRange),
      trnsIds: trnsIdsInRange,
    })

    return acc
  }, [] as IntervalData[])
}
</script>

<template>
  <div class="@container/stat">
    <StatChartWrap
      :series="chart.series.value"
      :xAxisLabels="chart.xAxisLabels.value"
    />

    <div class="grid gap-1 pb-5 md:max-w-lg">
      <StatDateNavigation :maxRange="statDate.maxRange.value" />
      <StatDateQuick
        v-if="statConfig.config.value.date.isShowQuick"
        :maxRange="statDate.maxRange.value"
      />
    </div>

    <StatSumWrap
      :isShowExpense="statTypeShow.expense"
      :isShowIncome="statTypeShow.income"
      :selectedType="selectedType"
      :total="rangeTotal"
      :averageTotal
      :type="props.type"
      @click="onClickSumItem"
    />

    <div class="grid w-full gap-2">
      <StatCategoriesSection
        v-if="props.hasChildren || (props.preCategoriesIds ?? []).length > 0"
        :isOneCategory="props.isOneCategory"
        :preCategoriesIds="props.preCategoriesIds"
        :selectedTrnsIds
        :storageKey="newBaseStorageKey"
        :type="props.type"
        @clickCategory="onClickCategory"
      />

      <StatTrnsSection
        :selectedTrnsIds
        :storageKey="newBaseStorageKey"
        :type="props.type"
        :isPeriodOneDay="isPeriodOneDay"
      />
    </div>

    <!-- Trns -->
    <Teleport to="body">
      <BottomSheet
        v-if="selectedTrnsIds && selectedTrnsIds?.length > 0 && isShowTrns"
        isShow
        drugClassesCustom="bottomSheetDrugClassesCustom"
        @closed="isShowTrns = false"
      >
        <div class="bottomSheetContent">
          <UiTitleModal>{{ t('trns.title') }} {{ selectedTrnsIds.length }}</UiTitleModal>

          <div class="scrollerBlock bottomSheetContentInside">
            <TrnsList
              :trnsIds="selectedTrnsIds"
              class="py-2"
              isShowDates
              isShowExpense
              isShowFilterByDesc
              isShowFilterByType
              isShowGroupSum
              isShowIncome
            />
          </div>
        </div>
      </BottomSheet>
    </Teleport>
  </div>
</template>
