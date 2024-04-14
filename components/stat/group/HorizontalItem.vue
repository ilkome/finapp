<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { ChartType } from '~/components/chart/types'
import type { FilterProvider } from '~/components/filter/useFilter'
import type { MoneyTypeNumber, MoneyTypeSlug, MoneyTypeSlugSum } from '~/components/stat/types'
import type { StatProvider } from '~/components/stat/useStat'
import type { TrnId } from '~/components/trns/types'
import { getTrnsIds } from '~/components/trns/getTrns'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { getDate } from '~/components/date/format'

const props = defineProps<{
  biggest: number
  total: number
  trnsIds: TrnId[]
  moneyTypeNumber: MoneyTypeNumber
  moneyTypeSlug: MoneyTypeSlug
  category: CategoryItem
  categoryId: CategoryId
}>()

const filter = inject('filter') as FilterProvider
const stat = inject('stat') as StatProvider

const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()

const isShowInside = ref(false)

const styles = computed(() => ({
  width: getWidthPercent(props.total, props.biggest),
  background: props.category.color,
}))

const isCategoryHasChildren = computed(() =>
  categoriesStore.isCategoryHasChildren(props.categoryId),
)

function toggleShowInside() {
  isShowInside.value = !isShowInside.value
}

function getWidthPercent(value: number, biggest: number): string {
  return `${(Math.abs(value) / Math.abs(biggest)) * 100}%`
}

const groupedCategories = computed(() => {
  return stat.getTotalCategories(stat.getCategoriesWithTrnsIds(props.trnsIds))
})

const chartSeriesOptions = {
  income: {
    color: 'var(--c-income-1)',
  },
  expense: {
    color: 'var(--c-expense-1)',
  },
  summary: {
    color: 'grey',
    type: 'line',
  },
}

const selectedDate = ref(+filter.date.value)

const chart = ref({
  selectedIdx: stat.chartCategories.value.findIndex((i: number) => +i === selectedDate.value),
  selectedIdx2: computed(() => stat.chartCategories.value.findIndex((i: number) => +i === selectedDate.value)),

  markedArea: computed(() =>
    stat.chartCategories.value.find((i: number) => +i === selectedDate.value),
  ),

  series: computed(() => chart.value.getSeries([props.moneyTypeSlug])),

  getSeries: (slugs: MoneyTypeSlugSum[]) => {
    return slugs.reduce((acc, slug) => {
      acc.push({
        data: stat.getStatDataPrepared(props.categoryId).map(i => i[slug]),
        ...chartSeriesOptions[slug],
        color: props.category.color,
      })
      return acc
    }, [] as {
      data: number[]
      color?: string
      type?: ChartType
    }[])
  },
})

function onClickChart(idx: number) {
  selectedDate.value = stat.chartCategories.value[idx]
}

const trnsIds = computed(() => getTrnsIds({
  trnsItems: trnsStore.items,
  categoriesIds: [props.categoryId],
  walletsIds: filter.walletsIds.value,
  dates: getDate(filter.periodNameWithoutAll.value, selectedDate.value),
}))
</script>

<template>
  <div
    class="_bg-item-4 rounded-lg"
    @click="toggleShowInside"
  >
    <div
      class="group flex items-center justify-between space-x-3 rounded-md px-1 py-1 hocus_bg-item-5"
    >
      <Icon2
        :categoryId="categoryId"
        :color="category.color"
        :icon="category.icon"
        @click="filter.toggleCategoryId(categoryId)"
      />

      <div class="grow">
        <div class="flex space-x-3 pr-1">
          <div class="flex grow items-baseline gap-2">
            <div class="text-sm leading-none text-secondary">
              {{ category.name }}{{ isCategoryHasChildren ? "..." : "" }}
            </div>

            <div
              v-if="category.parentId"
              class="grow truncate text-xs text-item-2 opacity-60"
            >
              {{ categoriesStore.items[category.parentId].name }}
            </div>
          </div>

          <Amount
            :amount="total"
            :currencyCode="currenciesStore.base"
            :type="moneyTypeNumber"
            :isShowBaseRate="false"
          />
        </div>

        <div class="mt-1 mt-1 rounded-[3px] bg-item-5">
          <div class="h-[4px] min-w-[2px] rounded-[3px]" :style="styles" />
        </div>
      </div>
    </div>

    <!-- Inside -->
    <div
      v-if="isShowInside"
      @click.stop=""
    >
      <div v-if="category.childIds && category.childIds?.length > 0" class="ml-10">
        <StatGroupHorizontal
          :categories="groupedCategories[props.moneyTypeSlug]"
          :moneyTypeSlug="props.moneyTypeSlug"
          :moneyTypeNumber="props.moneyTypeNumber"
        />
      </div>

      <div v-else class="">
        <LazyStatChartView
          :categories="stat.chartCategories.value"
          :isShowDataLabels="filter.ui.value.isShowDataLabels"
          :markedArea="chart.markedArea"
          :periodName="filter.periodNameWithoutAll.value"
          :series="chart.series"
          chartType="bar"
          @click="onClickChart"
        />

        <div class="scrollbar max-h-[40vh] overflow-hidden overflow-y-auto pb-1 _ml-10 -mr-1">
          <TrnsList :trnsIds="trnsIds" :isShowGroupDate="false" uiCat />
          <pre>{{ stat }}</pre>
          <StatTotalWithAverage2
            :item="{
              amount: 111,
              averageAmount: 2222,
              colorizeType: 'income',
              isShownAverage: true,
              moneyTypeNumber: 1,
              moneyTypeSlugSum: 'income',
            }"
          >
            <template #name>
              Hello
            </template>
          </StatTotalWithAverage2>
        </div>
      </div>
    </div>
  </div>
</template>
