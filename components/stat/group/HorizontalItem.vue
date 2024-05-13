<script setup lang="ts">
import dayjs from 'dayjs'
import { getTotal } from '~/components/amount/getTotal'
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import type { ChartType } from '~/components/chart/types'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { formatDateByPeriod, formatDateByPeriod2, getDates } from '~/components/date/format'
import type { FilterProvider } from '~/components/filter/useFilter'
import type { MoneyTypeNumber, MoneyTypeSlug, MoneyTypeSlugSum } from '~/components/stat/types'
import type { StatProvider } from '~/components/stat/useStat'
import { useSimpleTabs } from '~/components/tabs/useUtils'
import { getTrnsIds } from '~/components/trns/getTrns'
import type { TrnId } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  biggest: number
  category: CategoryItem
  categoryId: CategoryId
  isShowPeriodsTrns?: false
  moneyTypeNumber: MoneyTypeNumber
  moneyTypeSlug: MoneyTypeSlug
  total: number
  trnsIds: TrnId[]
}>()

const filter = inject('filter') as FilterProvider
const stat = inject('stat') as StatProvider

const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()

const isShowInside = ref(false)

const styles = computed(() => ({
  background: props.category.color,
  width: getWidthPercent(props.total, props.biggest),
}))

const hasChildren = computed(() =>
  categoriesStore.hasChildren(props.categoryId),
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
  expense: {
    color: 'var(--c-expense-1)',
  },
  income: {
    color: 'var(--c-income-1)',
  },
  summary: {
    color: 'grey',
    type: 'line',
  },
}

const selectedDate = ref(+filter.date.value)
watch(() => filter.date.value, v => selectedDate.value = v)

const chart = ref({
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
      color?: string
      data: number[]
      type?: ChartType
    }[])
  },

  markedArea: computed(() =>
    stat.chartCategories.value.find((i: number) => +i === selectedDate.value),
  ),

  selectedIdx: stat.chartCategories.value.findIndex((i: number) => +i === selectedDate.value),

  selectedIdx2: computed(() => stat.chartCategories.value.findIndex((i: number) => +i === selectedDate.value)),

  series: computed(() => chart.value.getSeries([props.moneyTypeSlug])),
})

function onClickChart(idx: number) {
  selectedDate.value = stat.chartCategories.value[idx]
}

// TODO: This should be in function to filtered from trnsIdsAllPeriods
const selectedTrnsIds = computed(() => getTrnsIds({
  categoriesIds: [props.categoryId],
  dates: getDates(filter.periodNameWithoutAll.value, selectedDate.value),
  trnsItems: trnsStore.items,
  walletsIds: filter.walletsIds.value,
}))

const selectedPeriodTotal = computed(() => getTotal({
  baseCurrencyCode: currenciesStore.base,
  rates: currenciesStore.rates,
  transferCategoriesIds: categoriesStore.transferCategoriesIds,
  trnsIds: selectedTrnsIds.value,
  trnsItems: trnsStore.items,
  walletsItems: walletsStore.items,
}))

// const periodsCount = stat.periodsToShow.value
const trnsIdsPeriodsExceptsLastOne = computed(() => getTrnsIds({
  categoriesIds: [props.categoryId],
  dates: {
    from: dayjs().startOf(filter.periodNameWithoutAll.value).subtract(stat.periodsToShow.value, filter.periodNameWithoutAll.value).valueOf(),
    until: dayjs().endOf('day').subtract(1, filter.periodNameWithoutAll.value).valueOf(),
  },
  trnsItems: trnsStore.items,
  walletsIds: filter.walletsIds.value,
}))

const totalAllPeriodsExceptsLastOne = computed(() => getTotal({
  baseCurrencyCode: currenciesStore.base,
  rates: currenciesStore.rates,
  transferCategoriesIds: categoriesStore.transferCategoriesIds,
  trnsIds: trnsIdsPeriodsExceptsLastOne.value,
  trnsItems: trnsStore.items,
  walletsItems: walletsStore.items,
}))

const { t } = useI18n()
const formattedDate = computed(() => formatDateByPeriod(selectedDate.value, filter.periodNameWithoutAll.value, {
  current: t('dates.week.current'),
  last: t('dates.week.last'),
}))

const tabs = useSimpleTabs(`stat-tabs-${props.categoryId}`, [{
  localeKey: 'stat.tabs.empty',
  slug: 'empty',
}, {
  localeKey: 'stat.tabs.trns',
  slug: 'trns',
}, {
  localeKey: 'stat.tabs.periods',
  slug: 'periods',
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
    v-if="props.category"
    :class="{
      'mb-3 border-item-5 bg-item-4 rounded-md': isShowInside,
    }"
    class="border border-transparent"
    @click="toggleShowInside"
  >
    <div
      class="group flex items-center justify-between space-x-3 rounded-md px-1 py-1 hocus_bg-item-5"
    >
      <Icon
        :color="category.color"
        :name="category.icon.replace('mdi mdi-', 'mdi:')"
        size="20"
        @click="filter.toggleCategoryId(categoryId)"
      />

      <div class="grow">
        <div class="flex space-x-3 pr-1">
          <div class="flex grow items-baseline gap-2">
            <div class="text-sm leading-none text-secondary">
              {{ category.name }}{{ hasChildren ? "..." : "" }}
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

        <div class="mt-1 rounded-[3px] bg-item-5">
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

      <div v-else class="grid gap-2">
        <div class="pt-3 pl-3">
          <StatTotalWithAverage3
            :item="{
              amount: selectedPeriodTotal[props.moneyTypeSlug],
              averageAmount: 0,
              colorizeType: props.moneyTypeSlug,
              isShownAverage: false,
              moneyTypeNumber: props.moneyTypeNumber,
              moneyTypeSlugSum: props.moneyTypeSlug,
            }"
          />
          {{ formattedDate }}
        </div>

        <LazyStatChartView
          :categories="stat.chartCategories.value"
          :isShowDataLabels="filter.ui.value.isShowDataLabels"
          :markedArea="chart.markedArea"
          :periodName="filter.periodNameWithoutAll.value"
          :series="chart.series"
          chartType="bar"
          @click="onClickChart"
        />

        <UiTabs2 class="gap-1">
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
            <!-- <div v-if="isShowPeriodsTrns && date === selectedDate">
              hey
            </div> -->
            <div class="mt-2 h-[1px] bg-item-5" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
