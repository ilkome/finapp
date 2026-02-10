<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { differenceInDays, differenceInMonths, differenceInWeeks } from 'date-fns'

import type { CategoryId } from '~/components/categories/types'
import type { Range, StatDateProvider } from '~/components/date/types'
import type { FilterProvider } from '~/components/stat/filter/types'
import type { ChartSeries, IntervalData, SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useAmount } from '~/components/amount/useAmount'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import StatCategoriesSection from '~/components/stat/categories/Section.vue'
import { useStatChart } from '~/components/stat/chart/useStatChart'
import { getTypesMapping } from '~/components/stat/utils'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  hasChildren?: boolean
  isOneCategory?: boolean
  isQuickModal?: boolean
  preCategoriesIds?: CategoryId[]
  statTab: StatTabSlug
  storageKey: string
  trnsIds: TrnId[]
  type?: SeriesSlugSelected
  walletId?: WalletId
}>()

const route = useRoute()
const filter = inject('filter') as FilterProvider
const statDate = inject('statDate') as StatDateProvider
const statConfig = inject('statConfig') as StatConfigProvider
const categoryId = computed(() => props.isOneCategory ? route.params.id as CategoryId : undefined)

const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()
const { addMarkArea, createSeriesItem } = useStatChart()

const newBaseStorageKey = computed(() => `finapp-${statDate.params.value.intervalsBy}-${props.storageKey}-${JSON.stringify(filter?.categoriesIds?.value)}`)
const filteredType = useStorage<SeriesSlugSelected>(`finapp-filtered-type-${props.type}-${newBaseStorageKey.value}`, 'netIncome')
const filteredCategoriesIds = ref<CategoryId[]>([])

const selectedType2 = computed(() => {
  if (props.statTab === 'summary')
    return filteredType.value

  if (props.statTab === 'split')
    return props.type

  return props.statTab
})

const selectedType3 = computed(() => {
  if (props.statTab === 'summary')
    return 'summary'

  if (props.statTab === 'split')
    return props.type

  return props.statTab
})

const selectedTypesMapping = computed(() => getTypesMapping(selectedType2.value))

const statTypeShow = computed(() => ({
  expense: true,
  income: true,
}))

const isPeriodOneDay = computed(() => (statDate.params.value.rangeBy === 'day' && statDate.params.value.rangeDuration === 1) || (statDate.params.value.intervalsBy === 'day' && statDate.params.value.intervalSelected !== -1))

const rangeTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
  trnsIds: props.trnsIds,
}, {
  includesChildCategories: false,
}))

const rangeTrnsIdsWithFilteredCategories = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filteredCategoriesIds.value,
  trnsIds: props.trnsIds,
}, {
  includesChildCategories: true,
}))

const intervalsData = computed(() => getIntervalsData(rangeTrnsIds.value, statDate.intervalsInRange.value))
const intervalsDataWithFilteredCategories = computed(() => getIntervalsData(rangeTrnsIdsWithFilteredCategories.value, statDate.intervalsInRange.value))

const selectedTrnsIds = computed(() => {
  return trnsStore.getStoreTrnsIds({
    trnsIds: statDate.params.value.intervalSelected !== -1
      ? intervalsData.value[statDate.params.value.intervalSelected]?.trnsIds
      : rangeTrnsIds.value,
    trnsTypes: selectedTypesMapping.value,
  }, { includesChildCategories: false })
})

const selectedAndFilteredTrnsIds = computed(() => {
  return trnsStore.getStoreTrnsIds({
    categoriesIds: filteredCategoriesIds.value,
    trnsIds: statDate.params.value.intervalSelected !== -1
      ? intervalsData.value[statDate.params.value.intervalSelected]?.trnsIds
      : rangeTrnsIds.value,
    trnsTypes: selectedTypesMapping.value,
  }, { includesChildCategories: true })
})

function onSetCategoryFilter(categoryId: CategoryId) {
  if (filteredCategoriesIds.value.includes(categoryId))
    return filteredCategoriesIds.value = []

  filteredCategoriesIds.value = [categoryId]
}

const rangeTotal = computed(() => {
  const trnsIds = statDate.params.value.intervalSelected !== -1
    ? intervalsDataWithFilteredCategories.value[statDate.params.value.intervalSelected]?.trnsIds
    : rangeTrnsIdsWithFilteredCategories.value

  return getTotalOfTrnsIds(trnsIds)
})

const averageTotal = computed(() => {
  if (differenceInDays(statDate.range.value.end, statDate.range.value.start) < 2)
    return

  const sum = filteredType.value === 'netIncome' ? rangeTotal.value.sum : rangeTotal.value[props.type]

  const date = statDate.params.value.intervalSelected !== -1
    ? statDate.selectedInterval.value
    : statDate.range.value

  const dif = {
    day: differenceInDays(date?.end, date?.start) + 1,
    month: differenceInMonths(date?.end, date?.start) + 1,
    week: differenceInWeeks(date?.end, date?.start) + 1,
  }

  const items = {
    month: 0,
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

const typesToShow = computed(() => {
  if (props.statTab === 'summary') {
    if (filteredType.value === 'netIncome')
      return ['income', 'expense']

    if (filteredType.value === 'income')
      return ['income']

    if (filteredType.value === 'expense')
      return ['expense']
  }

  if (props.statTab === 'expense' || props.statTab === 'income')
    return [props.statTab]

  return [props.type]
})

const chart = {
  series: computed<ChartSeries[]>(() => {
    const intervalTotals = intervalsDataWithFilteredCategories.value.map(g => g.total)
    const baseSeries = typesToShow.value.map(type => createSeriesItem(type, intervalTotals, statConfig.config.value.chart.isShowAverage ? intervalsDataWithFilteredCategories.value.reduce((acc, i) => acc + i.total[type], 0) / (intervalsData.value.length) : false))

    const selectedInterval = intervalsDataWithFilteredCategories.value?.[statDate.params.value.intervalSelected]
    if (!selectedInterval?.range.start || statDate.params.value.intervalSelected < 0)
      return baseSeries

    return addMarkArea(baseSeries, selectedInterval.range.start, statConfig.config.value?.chartType)
  }),
  xAxisLabels: computed(() => intervalsDataWithFilteredCategories.value.map(i => +i.range.start) ?? []),
}

const quickViewTrns = ref<TrnId[]>([])

function onClickCategory(categoryId: CategoryId) {
  if (route.name === 'categories-id') {
    filter.setCategoryId(categoryId)

    const baseParams = {
      filterCategories: filter?.categoriesIds?.value.join(','),
      filterWallets: props.walletId ? props.walletId : filter?.walletsIds?.value.join(','),
      storageKey: props.storageKey ?? '',
    }

    const queryParams = new URLSearchParams({ ...baseParams }).toString()
    return useRouter().push(`/categories/${categoryId}?${queryParams}`)
  }

  // Show quick view
  quickViewTrns.value = trnsStore.getStoreTrnsIds({
    categoriesIds: [categoryId],
    trnsIds: selectedAndFilteredTrnsIds.value,
  }, { includesChildCategories: true })
}

const isShowTrns = ref(false)
function onClickSumItem(type: SeriesSlugSelected) {
  if (type === 'netIncome') {
    isShowTrns.value = true
  }

  filteredType.value = type === filteredType.value ? 'netIncome' : type
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
      v-if="!props.isOneCategory || (props.isOneCategory && !categoriesStore.transferCategoriesIds.includes(categoryId))"
      :chartView="statConfig.config.value.chartView"
      :series="chart.series.value"
      :xAxisLabels="chart.xAxisLabels.value"
      class="pb-3"
    >
      <StatDateQuick v-if="statConfig.config.value.date.isShowQuick" />
    </StatChartWrap>

    <div class="grid content-start gap-3">
      <StatDateNavigation>
        <StatFilterSelected
          v-if="filter.isShow?.value && filter.categoriesIds.value.length > 0 || filter.walletsIds.value.length > 0"
          isShowCategories
          isShowWallets
        />
      </StatDateNavigation>

      <StatSumWrap
        v-if="!props.isOneCategory || (props.isOneCategory && !categoriesStore.transferCategoriesIds.includes(categoryId))"
        :averageConfig="statConfig.config.value.statAverage.count"
        :averageTotal
        :categoryId
        :filter
        :filteredType="filteredType"
        :isShowAverage="statConfig.config.value.statAverage.isShow"
        :isShowExpense="statTypeShow.expense"
        :isShowIncome="statTypeShow.income"
        :statDate
        :total="rangeTotal"
        :trnsIds
        :type="selectedType3"
        :walletId
        @click="onClickSumItem"
        @clickAverage="statConfig.updateConfig('statAverage', { isShow: !statConfig.config.value.statAverage.isShow })"
      />

      <div class="_min-h-dvh grid content-start items-start gap-4">
        <StatCategoriesSection
          v-if="statConfig.config.value.catsRound.isShow && (props.hasChildren || (props.preCategoriesIds ?? []).length > 0)"
          :filteredCategoriesIds
          :isOneCategory="props.isOneCategory"
          :preCategoriesIds="props.preCategoriesIds || categoriesStore.favoriteCategoriesIds"
          :selectedTrnsIds
          @clickCategory="onClickCategory"
          @onSetCategoryFilter="onSetCategoryFilter"
        />

        <div
          :class="{
            'grid gap-5 @3xl/page:grid-cols-2 @3xl/page:gap-6': props.statTab !== 'split' && statConfig.config.value.catsList.isShow,
          }"
        >
          <StatCategoriesSection2
            v-if="(statConfig.config.value.catsList.isShow || statConfig.config.value.vertical.isShow) && (props.hasChildren || (props.preCategoriesIds ?? []).length > 0)"
            :isOneCategory="props.isOneCategory"
            :preCategoriesIds="props.preCategoriesIds"
            :selectedTrnsIds="selectedAndFilteredTrnsIds"
            :storageKey="newBaseStorageKey"
            :type="props.type ?? 'netIncome'"
            @clickCategory="onClickCategory"
            @onSetCategoryFilter="onSetCategoryFilter"
          />

          <StatTrns
            :isPeriodOneDay="isPeriodOneDay"
            :selectedTrnsIds="selectedAndFilteredTrnsIds"
            :storageKey="newBaseStorageKey"
            :type="props.type ?? 'netIncome'"
            class="@3xl/page:order-1"
          />
        </div>
      </div>
    </div>

    <!-- Quick View Trns -->
    <Teleport
      v-if="quickViewTrns?.length > 0"
      to="#pageScroll"
    >
      <BottomSheet
        v-if="quickViewTrns?.length > 0"
        isShow
        drugClassesCustom="bottomSheetDrugClassesCustom"
        @closed="quickViewTrns = []"
      >
        <template #handler="{ close }">
          <BottomSheetHandler />
          <BottomSheetClose @onClick="close" />
        </template>

        <div class="bottomSheetContent">
          <UiTitleModal>
            {{ t('trns.title') }} {{ quickViewTrns.length > 0 ? quickViewTrns.length : '' }}
          </UiTitleModal>

          <div class="scrollerBlock bottomSheetContentInside pb-2">
            <TrnsList
              :isShowDates="!isPeriodOneDay"
              :isShowGroupSum="!isPeriodOneDay"
              :size="50"
              :trnsIds="quickViewTrns"
              isShowExpense
              isShowFilterByDesc
              isShowFilterByType
              isShowIncome
              isShowTransfers
              @click="() => quickViewTrns = []"
            />
          </div>
        </div>
      </BottomSheet>
    </Teleport>

    <Teleport to="body">
      <BottomSheet
        v-if="isShowTrns"
        isShow
        drugClassesCustom="bottomSheetDrugClassesCustom"
        @closed="isShowTrns = false"
      >
        <template #handler="{ close }">
          <BottomSheetHandler />
          <BottomSheetClose @onClick="close" />
        </template>

        <div class="bottomSheetContent">
          <UiTitleModal>
            {{ t('trns.title') }} {{ selectedAndFilteredTrnsIds.length > 0 ? selectedAndFilteredTrnsIds.length : '' }}
          </UiTitleModal>

          <div class="scrollerBlock bottomSheetContentInside">
            <TrnsList
              :isShowDates="!isPeriodOneDay"
              :isShowGroupSum="!isPeriodOneDay"
              :size="50"
              :trnsIds="selectedAndFilteredTrnsIds"
              isShowExpense
              isShowFilterByDesc
              isShowFilterByType
              isShowIncome
              isShowTransfers
            />
          </div>
        </div>
      </BottomSheet>
    </Teleport>
  </div>
</template>
