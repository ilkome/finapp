<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { FilterProvider } from '~/components/filter/types'
import type { CategoryWithData, ChartSeries, IntervalData, MoneyTypeSlugNew } from '~/components/stat/types'
import type { Range, StatDateProvider } from '~/components/date/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { TrnId } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { WalletId } from '~/components/wallets/types'
import { useStatCategories } from '~/composables/useStatCategories'
import { useStatChart } from '~/composables/useStatChart'
import StatTrnsSection from '~/components/stat/trns/Section.vue'
import StatCategoriesSection from '~/components/stat/categories/Section.vue'

const props = defineProps<{
  hasChildren: boolean
  isQuickModal?: boolean
  preCategoriesIds?: CategoryId[]
  storageKey: string
  trnsIds: TrnId[]
  type: MoneyTypeSlugNew
  walletId?: WalletId
}>()

const route = useRoute()
const filter = inject('filter') as FilterProvider
const statDate = inject('statDate') as StatDateProvider
const statConfig = inject('statConfig') as StatConfigProvider

const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()
const { getCategoriesWithData } = useStatCategories()
const { addMarkArea, createSeriesItem } = useStatChart()

const isShowTrns = ref(false)

const newBaseStorageKey = computed(() => `finapp-${statDate.params.value.intervalsBy}-${props.storageKey}-${JSON.stringify(filter?.categoriesIds?.value)}`)

const selectedType = ref<MoneyTypeSlugNew>('summary')
const selectedTypesMapping = computed(() => {
  const typeMapping = {
    expense: [0, 2],
    income: [1, 2],
    summary: [0, 1, 2],
  } as const

  const trnsTypes = typeMapping[selectedType.value]

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
    dates: {
      from: statDate.range.value.start,
      until: statDate.range.value.end,
    },
    trnsIds: props.trnsIds,
  }

  return trnsStore.getStoreTrnsIds(params, { includesChildCategories: false })
})

const intervalsData = computed(() => getIntervalsData(rangeTrnsIds.value, statDate.intervalsInRange.value))

const chartTrnsIds = computed(() => {
  if (!selectedTypesMapping.value) {
    return rangeTrnsIds.value
  }

  return trnsStore.getStoreTrnsIds({
    trnsIds: rangeTrnsIds.value,
    trnsTypes: selectedTypesMapping.value,
  }, { includesChildCategories: false })
})

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

const categoriesWithData = computed<CategoryWithData[]>(() => {
  const isGrouped = statConfig.config.value[statConfig.config.value.catsView === 'list' ? 'catsList' : 'catsRound'].isGrouped

  const cats: CategoryId[] = []
  if (statConfig.config.value?.isShowEmptyCategories && props.preCategoriesIds) {
    cats.push(...props.preCategoriesIds)
  }

  return getCategoriesWithData(selectedTrnsIds.value ?? [], isGrouped, cats)
})

const chart = {
  series: computed<ChartSeries[]>(() => {
    const intervalsChartData = getIntervalsData(chartTrnsIds.value, statDate.intervalsInRange.value)
    const transactionTypes = {
      hasExpense: chartTrnsIds.value.some(id => trnsStore.items?.[id]?.type === 0),
      hasIncome: chartTrnsIds.value.some(id => trnsStore.items?.[id]?.type === 1),
    }

    const typesToShow = props.type === 'netIncome'
      ? [
          ...(transactionTypes.hasIncome ? ['income'] : []),
          ...(transactionTypes.hasExpense ? ['expense'] : []),
        ] as MoneyTypeSlugNew[]
      : [props.type]

    const intervalTotals = intervalsChartData.map(g => g.total)
    const baseSeries = typesToShow.map(type => createSeriesItem(type, intervalTotals))

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

    <StatSumWrap
      :isShowExpense="statTypeShow.expense"
      :isShowIncome="statTypeShow.income"
      :selectedType="selectedType"
      :total="rangeTotal"
      :type="props.type"
      @click="onClickSumItem"
    />

    <div class="grid gap-6 pt-4">
      <StatCategoriesSection
        v-if="props.hasChildren"
        :categoriesWithData="categoriesWithData"
        :storageKey="newBaseStorageKey"
        :type="props.type"
        @clickCategory="onClickCategory"
      />

      <StatTrnsSection
        :selectedTrnsIds="selectedTrnsIds"
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
        drugClassesCustom="bg-foreground-1 max-w-md"
        @closed="isShowTrns = false"
      >
        <div class="scrollerBlock grid h-[98dvh] content-start overflow-hidden overflow-y-auto">
          <TrnsList
            :trnsIds="selectedTrnsIds"
            class="p-2"
            isShowDates
            isShowExpense
            isShowFilterByDesc
            isShowFilterByType
            isShowGroupSum
            isShowHeader
            isShowIncome
          />
        </div>
      </BottomSheet>
    </Teleport>
  </div>
</template>
