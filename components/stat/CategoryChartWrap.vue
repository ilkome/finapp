<script setup lang="ts">
import type { MoneyTypeSlugSum } from '~/components/stat/types'
import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useCategoriesStore } from '~/components/categories/useCategories'
import type { ChartType } from '~/components/chart/types'
import type { PeriodNameWithoutAll } from '~/components/filter/useFilter'
import type { TotalReturns } from '~/components/amount/getTotal'
import useAmount from '~/components/amount/useAmount'
import { useNewStat } from '~/components/stat/useNewStat'

const props = defineProps<{
  categoryId: CategoryId
  chartPeriodsShown: number
  datesGroups: Record<string, TrnId[]>
  markedArea: number
  period: PeriodNameWithoutAll
  trnsIds: TrnId[]
  type: MoneyTypeSlugSum
}>()

const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()
const categoriesStore = useCategoriesStore()
const { getPeriodsWithTrns, getSeries } = useNewStat()

const category = computed(() => categoriesStore.items[props.categoryId])

const selectedTrnsIds = computed(() =>
  props.trnsIds.filter((trnId) => {
    if (category.value.childIds?.includes(trnsStore.items[trnId]?.categoryId))
      return true
    if (trnsStore.items[trnId]?.categoryId === props.categoryId)
      return true
    return false
  }),
)

const chartType = ref<ChartType>('bar')

const categories = computed(() => Object.keys(props.datesGroups).map(date => +date) ?? [])

const periodsWithTrnsIds = computed(() => getPeriodsWithTrns(selectedTrnsIds.value, props.period, props.datesGroups))

const groupedTrnsTotals = computed(() =>
  Object.keys(periodsWithTrnsIds.value)
    .sort((a, b) => +a - +b)
    .reduce(
      (acc, date) => {
        acc[date] = getTotalOfTrnsIds(periodsWithTrnsIds.value[date])
        return acc
      },
      {} as Record<string, TotalReturns>,
    ),
)

const series = computed(() => getSeries(groupedTrnsTotals.value, props.type))

const config = computed(() => {
  if (Object.keys(groupedTrnsTotals.value).length >= 30) {
    return {
      dataZoom: [
        {
          filterMode: 'filter',
          maxValueSpan: props.chartPeriodsShown,
          minValueSpan: props.chartPeriodsShown,
          preventDefaultMouseMove: false,
          roam: false,
          start: 100,
          type: 'inside',
          zoomOnMouseWheel: false,
        },
      ],
    }
  }

  return {
    dataZoom: false,
  }
})
</script>

<template>
  <div class="pl-6">
    <LazyStatChartView
      :markedArea="props.markedArea"
      :categories
      :series
      :chartType
      :periodName="props.period"
      :config
    />
  </div>
</template>
