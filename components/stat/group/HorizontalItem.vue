<script setup lang="ts">
import dayjs from 'dayjs'
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
import { formatDateByPeriod, formatDateByPeriod2, getDates } from '~/components/date/format'
import { getTotal } from '~/components/amount/getTotal'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useSimpleTabs } from '~/components/tabs/useUtils'
import { getStyles } from '~/components/ui/classes'

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
const walletsStore = useWalletsStore()

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
watch(() => filter.date.value, v => selectedDate.value = v)

const chart = ref({
  selectedIdx: stat.chartCategories.value.findIndex((i: number) => +i === selectedDate.value),
  selectedIdx2: computed(() => stat.chartCategories.value.findIndex((i: number) => +i === selectedDate.value)),

  markedArea: computed(() =>
    stat.chartCategories.value.find((i: number) => +i === selectedDate.value),
  ),

  series: computed(() => chart.value.getSeries([props.moneyTypeSlug])),

  data: stat.getStatDataPrepared(props.categoryId).map(i => i[props.moneyTypeSlug]),

  getSeries: (slugs: MoneyTypeSlugSum[]) => {
    return slugs.reduce((acc, slug) => {
      acc.push({
        data: chart.value.data,
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

// TODO: This should be in function to filtered from trnsIdsAllPeriods
const selectedTrnsIds = computed(() => getTrnsIds({
  trnsItems: trnsStore.items,
  categoriesIds: [props.categoryId],
  walletsIds: filter.walletsIds.value,
  dates: getDates(filter.periodNameWithoutAll.value, selectedDate.value),
}))

const selectedPeriodTotal = computed(() => getTotal({
  baseCurrencyCode: currenciesStore.base,
  rates: currenciesStore.rates,
  trnsIds: selectedTrnsIds.value,
  trnsItems: trnsStore.items,
  walletsItems: walletsStore.items,
  transferCategoriesIds: categoriesStore.transferCategoriesIds,
}))

// const periodsCount = stat.periodsToShow.value
const trnsIdsPeriodsExceptsLastOne = computed(() => getTrnsIds({
  trnsItems: trnsStore.items,
  walletsIds: filter.walletsIds.value,
  categoriesIds: [props.categoryId],
  dates: {
    from: dayjs().startOf(filter.periodNameWithoutAll.value).subtract(stat.periodsToShow.value, filter.periodNameWithoutAll.value).valueOf(),
    until: dayjs().endOf('day').subtract(1, filter.periodNameWithoutAll.value).valueOf(),
  },
}))

const totalAllPeriodsExceptsLastOne = computed(() => getTotal({
  baseCurrencyCode: currenciesStore.base,
  rates: currenciesStore.rates,
  trnsIds: trnsIdsPeriodsExceptsLastOne.value,
  trnsItems: trnsStore.items,
  walletsItems: walletsStore.items,
  transferCategoriesIds: categoriesStore.transferCategoriesIds,
}))

const { t } = useI18n()
const formattedDate = computed(() => formatDateByPeriod(selectedDate.value, filter.periodNameWithoutAll.value, {
  current: t('dates.week.current'),
  last: t('dates.week.last'),
}))

const tabs = useSimpleTabs(`stat-tabs-${props.categoryId}`, [{
  slug: 'empty',
  localeKey: 'stat.tabs.empty',
}, {
  slug: 'trns',
  localeKey: 'stat.tabs.trns',
}, {
  slug: 'periods',
  localeKey: 'stat.tabs.periods',
}])

function getFormattedDate(date: number) {
  return formatDateByPeriod2(date, filter.periodNameWithoutAll.value, {
    current: t('dates.week.current'),
    last: t('dates.week.last'),
  })
}
</script>

<template>
  <div
    :class="{
      'pb-3': isShowInside,
    }"
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
          <div class="grid gap-2">
            <div class="pl-3">
              <StatTotalWithAverage2
                :item="{
                  amount: selectedPeriodTotal[props.moneyTypeSlug],
                  averageAmount: 0,
                  colorizeType: props.moneyTypeSlug,
                  isShownAverage: false,
                  moneyTypeNumber: props.moneyTypeNumber,
                  moneyTypeSlugSum: props.moneyTypeSlug,
                }"
              >
                <template #name>
                  {{ formattedDate }}
                </template>
              </StatTotalWithAverage2>
            </div>

            <UiTabs2 class="gap-1 bg-item-4 rounded-md">
              <UiTabsItem2
                v-for="tabItem in tabs.items"
                :key="tabItem.slug"
                :isActive="tabs.active.value === tabItem.slug"
                @click="tabs.set(tabItem.slug)"
              >
                {{ t(tabItem.localeKey) }}
              </UiTabsItem2>
            </UiTabs2>

            <TrnsList
              v-if="tabs.active.value === 'trns'"
              :trnsIds="selectedTrnsIds"
              :isShowGroupDate="false"
              uiCat
            />

            <div
              v-if="tabs.active.value === 'periods'"
            >
              <div
                v-for="date in [...stat.chartCategories.value].reverse()"
                :key="date"
                :class="[
                  { '!bg-item-3 !px-2 !mx-0': date === selectedDate },
                ]"
                class="group rounded-md hocus_bg-item-5 -mt-[1px] pt-2 px-0 mx-2 hocus_px-2 hocus_mx-0"
                @click="onClickChart(stat.chartCategories.value.findIndex(d => d === date))"
              >
                <div
                  class="flex items-center text-secondary"
                >
                  <div class="grow font-mono text-xs text-secondary">
                    {{ getFormattedDate(date) }}
                  </div>

                  <Amount
                    :amount="chart.data[stat.chartCategories.value.findIndex(d => d === date)]"
                    :currencyCode="currenciesStore.base"
                  />
                </div>
                <div class="mt-2 h-[1px] bg-item-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
