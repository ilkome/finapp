<script setup lang="ts">
import dayjs from 'dayjs'
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '../categories/types'
import type { MoneyTypeSlugSum } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import type { ChartType } from '~/components/chart/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { TotalReturns } from '~/components/amount/getTotal'
import type { FilterProvider, PeriodNameWithoutAll } from '~/components/filter/useFilter'
import { getStyles } from '~/components/ui/getStyles'
import { useNewStat } from '~/components/stat/useNewStat'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { getDates } from '~/components/date/format'

const props = defineProps<{
  storageKey?: string
  trnsIds: TrnId[]
  type: MoneyTypeSlugSum
}>()

const filter = inject('filter') as FilterProvider
const { t } = useI18n()
const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()
const { getCats, getPeriodsWithTrns, getSeries } = useNewStat()
const categoriesStore = useCategoriesStore()

const isShowLinesChart = useStorage<boolean>('isShowLinesChart', false)
const period = useStorage<PeriodNameWithoutAll>(`${props.storageKey}-period`, 'month')

const newBaseStorageKey = computed(() => `${period.value}-${props.storageKey}-${JSON.stringify(filter.catsIds.value)}`)
const baseStorageKey = computed(() => `${period.value}-${props.storageKey}-${JSON.stringify(filter.catsIds.value)}`)
// const chartPeriodsShown = useStorage<number>(`${period.value}-${props.storageKey}-${props.type}-${JSON.stringify(filter.catsIds.value)}-chartPeriodsShown`, 12)

// TODO: Get from parent
const chartPeriodsShown2 = ref(+(localStorage.getItem(`1${period.value}-${props.storageKey}-${JSON.stringify(filter.catsIds.value)}-chartPeriodsShown`) ?? 12))
const chartType = useStorage<ChartType>(`${baseStorageKey.value}-chartType`, 'bar')
const chartTypes = computed(() => [{
  name: t('chart.types.bar'),
  value: 'bar',
}, {
  name: t('chart.types.line'),
  value: 'line',
}])
const date = useStorage<number>(`${props.storageKey}-date`, dayjs().startOf(period.value).valueOf())

const datesFromTrnsIds = computed(() => ({
  from: trnsStore.items[props.trnsIds.at(-1)]?.date,
  until: trnsStore.items[props.trnsIds.at(0)]?.date,
}))

onMounted(
  () =>
    (date.value = dayjs(datesFromTrnsIds.value.until)
      .startOf(period.value)
      .valueOf()),
)

const periodsEmptyTrnsIds = computed(() =>
  getPeriodsWithEmptyTrnsIds({
    from: datesFromTrnsIds.value.from,
    period: period.value,
    until: datesFromTrnsIds.value.until,
  }),
)

const periodsWithTrnsIds = computed(() => getPeriodsWithTrns(props.trnsIds, period.value, periodsEmptyTrnsIds.value))

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

const categories = computed(
  () => Object.keys(periodsEmptyTrnsIds.value).map(date => +date) ?? [],
)
const series = computed(() => getSeries(groupedTrnsTotals.value, props.type))
const selectedTrnsIdsForTrnsList = computed(
  () => periodsWithTrnsIds.value[date.value],
)
const totals = computed(() =>
  getTotalOfTrnsIds(selectedTrnsIdsForTrnsList.value),
)

const config = computed(() => {
  if (Object.keys(groupedTrnsTotals.value).length >= chartPeriodsShown2.value) {
    return {
      dataZoom: [
        {
          filterMode: 'filter',
          maxValueSpan: chartPeriodsShown2.value,
          minValueSpan: chartPeriodsShown2.value - 1,
          // moveOnMouseMove: false,
          preventDefaultMouseMove: false,
          // moveOnMouseWheel: false,
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

function setPeriodAndDate(periodName: PeriodNameWithoutAll) {
  const d = localStorage.getItem(`1${periodName}-${props.storageKey}-${JSON.stringify(filter.catsIds.value)}-chartPeriodsShown`)
  period.value = periodName
  date.value = dayjs(categories.value.at(-1)).startOf(periodName).valueOf()
  chartPeriodsShown2.value = +(d ?? 12)
}

function changeChartPeriodsShown2(n: number) {
  localStorage.setItem(`1${period.value}-${props.storageKey}-${JSON.stringify(filter.catsIds.value)}-chartPeriodsShown`, `${n}`)
  chartPeriodsShown2.value = n
}

function setPeriodDateNext() {
  const newDate = dayjs(date.value).subtract(1, period.value).valueOf()
  if (categories.value.includes(newDate))
    date.value = newDate
}

function setPeriodDatePrev() {
  const newDate = dayjs(date.value).add(1, period.value).valueOf()

  if (categories.value.includes(newDate))
    date.value = newDate
}

function onClickChart(idx: number) {
  date.value = categories.value[idx]
}

// TODO: move to dates utils
function getPeriodsWithEmptyTrnsIds(params: {
  from: number
  period: PeriodNameWithoutAll
  until: number
}) {
  const list: Record<string, TrnId[]> = {}
  let current = dayjs(params.from).startOf(params.period).valueOf()

  while (current < params.until) {
    list[current] = []
    current = dayjs(current)
      .add(1, params.period)
      .startOf(params.period)
      .valueOf()
  }

  return list
}

/**
 * Cats
 */
const isGroupCategoriesByParent = useStorage<boolean>(`${baseStorageKey.value}-isGroupCategoriesByParent`, false)
const isGroupCategoriesByParentRounded = useStorage<boolean>(`${baseStorageKey.value}-isGroupCategoriesByParentRounded`, true)

const cats = computed(() => getCats(selectedTrnsIdsForTrnsList.value ?? [], isGroupCategoriesByParent.value))
const catsRounded = computed(() => getCats(selectedTrnsIdsForTrnsList.value ?? [], isGroupCategoriesByParentRounded.value))

const biggestCatNumber = computed(() => cats.value.at(0)?.value ?? 0)

const isOpenedAll = useStorage<boolean>(`${baseStorageKey.value}-isOpenedAll`, false)
const openedCats = useStorage<CategoryId[]>(`${baseStorageKey.value}-openedCats`, [])
const openedTrns = useStorage<CategoryId[]>(`${baseStorageKey.value}-openedTrns`, [])
const catsView = useStorage<'list' | 'round'>(`${baseStorageKey.value}-catsView`, 'list')

watch(cats, () => {
  if (isOpenedAll.value) {
    openedCats.value = cats.value.map(d => d.id)
  }
}, { immediate: true })

function toggleCats() {
  if (openedCats.value.length === cats.value.length) {
    openedCats.value = []
  }
  else {
    openedCats.value = cats.value.map(d => d.id)
  }
}

function onClickCategory(categoryId: CategoryId) {
  const category = categoriesStore.items[categoryId]

  if (category?.childIds && category?.childIds?.length > 0) {
    openedCats.value.includes(categoryId)
      ? (openedCats.value = openedCats.value.filter(d => d !== categoryId))
      : openedCats.value.push(categoryId)
  }

  else {
    openedTrns.value.includes(categoryId)
      ? (openedTrns.value = openedTrns.value.filter(d => d !== categoryId))
      : openedTrns.value.push(categoryId)
  }
}

// function onClickCategoryIcon(categoryId: CategoryId) {
//   filter.setCategoryId(categoryId)
// }

function onClickCategoryRounded(categoryId: CategoryId) {
  isGroupCategoriesByParentRounded.value = false
  filter.clearFilter()
  filter.setCategoryId(categoryId)
  // const category = categoriesStore.items[categoryId]

  // if (category?.childIds && category?.childIds?.length > 0) {
  //   isGroupCategoriesByParentRounded.value = false
  // }
  // else {
  //   isGroupCategoriesByParentRounded.value = true
  // }
}

const isAllCatsOpened = computed(() => arraysAreEqualUnordered(cats.value.map(d => d.id), openedCats.value))

function arraysAreEqualUnordered(arr1: CategoryId[], arr2: CategoryId[]) {
  // Check if the lengths are the same
  if (arr1.length !== arr2.length) {
    return false
  }

  // Sort both arrays
  const sortedArr1 = arr1.slice().sort()
  const sortedArr2 = arr2.slice().sort()

  // Check each element
  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false
    }
  }

  // If all elements are the same
  return true
}

function getTrnsWithDate(categoryId: CategoryId) {
  return trnsStore.getStoreTrnsIds({
    categoriesIds: [categoryId],
    dates: getDates(period.value, date.value),
    trnsIds: props.trnsIds,
  }, { includesChildCategories: true })
}

// function transformData(data) {
//   const series = []
//   const idMap = {}
//   const timestamps = Object.keys(data).sort()

//   // Collect all unique IDs
//   for (const timestamp of timestamps) {
//     const entries = data[timestamp]

//     for (const entryId in entries) {
//       const id = entries[entryId].id
//       if (!idMap[id]) {
//         idMap[id] = {
//           color: categoriesStore.items[id].color,
//           data: Array.from({ length: timestamps.length }).fill(0),
//           id,
//           name: categoriesStore.items[id].name,
//           // stack: 'hey',
//         }
//         series.unshift(idMap[id])
//       }
//     }
//   }

//   // Fill in the data values
//   timestamps.forEach((timestamp, index) => {
//     const entries = data[timestamp]
//     for (const entryId in entries) {
//       if (entries[entryId]) {
//         const entry = entries[entryId]
//         const id = entry.id
//         const value = entry.value
//         idMap[id].data[index] = Math.abs(value)
//       }
//     }
//   })

//   return series
// }

// function onClickInsideCategory(idx: number) {
//   console.log('onClickInsideCategory')
//   date.value = categories.value[idx]
// }
</script>

<template>
  <div class="grid content-start gap-3">
    <!-- Date -->
    <div class="grid gap-3">
      <StatSum
        :amount="totals[props.type]"
        :type="props.type"
      />

      <div class="flex grow">
        <StatDateNav
          :isLastPeriod="+categories.at(0) === +date"
          :isToday="+categories.at(-1) === +date"
          @setNextPeriodDate="setPeriodDateNext"
          @setPeriodAndDate="() => (date = +categories.at(-1))"
          @setPrevPeriodDate="setPeriodDatePrev"
        />

        <StatDateView
          :date="date"
          :periodNameWithAll="period"
          :periodsNames="filter.periodsNames.value"
          :periods="filter.periods.value"
          @setPeriodAndDate="setPeriodAndDate"
        />
      </div>
    </div>

    <!-- Stat -->
    <div class="_@3xl/main:grid-cols-[1fr,.8fr] _gap-8 grid @container/stat">
      <div class="grid gap-2">
        <div class="grid @4xl/stat:grid-cols-[1.4fr,auto] @4xl/stat:gap-4">
          <!-- Chart first level -->
          <UiToggle
            :storageKey="`${newBaseStorageKey}-chart-root`"
            :initStatus="true"
            class="md:max-w-xl"
          >
            <template #header="{ toggle, isShown }">
              <div class="flex items-center justify-between">
                <UiTitle
                  :class="getStyles('item', ['link', 'center', 'padding3', 'minh', 'minw1', 'rounded'])"
                  class="grow flex items-center gap-2 pb-0"
                  @click="toggle"
                >
                  <Icon
                    v-if="!isShown"
                    name="mdi:chevron-right"
                    size="22"
                    class="-ml-1"
                  />
                  <div>{{ $t('chart.title') }}</div>
                </UiTitle>

                <VDropdown
                  v-if="isShown"
                  :overflowPadding="12"
                  autoBoundaryMaxSize
                  placement="bottom-start"
                  class="group"
                >
                  <div
                    :class="getStyles('item', ['link', 'center', 'minh', 'minw1', 'rounded'])"
                    class="justify-center text-xl"
                  >
                    <UiIconConfig />
                  </div>

                  <template #popper="{ hide }">
                    <div class="grid gap-4 p-3 min-w-52">
                      <UiTitle>{{ $t('chart.options') }}</UiTitle>
                      <USelect
                        v-model.number="chartPeriodsShown2"
                        :options="Array.from({ length: 30 }, (_, i) => i + 1)"
                        color="blue"
                        size="lg"
                      />
                      <div @click="() => changeChartPeriodsShown2(30)">
                        30
                      </div>
                      <div @click="() => changeChartPeriodsShown2(8)">
                        8
                      </div>
                      <div @click="() => changeChartPeriodsShown2(7)">
                        7
                      </div>
                      <div @click="() => changeChartPeriodsShown2(12)">
                        12
                      </div>
                      <div @click="() => changeChartPeriodsShown2(3)">
                        3
                      </div>
                      <div @click="() => changeChartPeriodsShown2(1)">
                        1
                      </div>
                      <div @click="() => changeChartPeriodsShown2(24)">
                        24
                      </div>

                      <USelect
                        v-model="chartType"
                        :options="chartTypes"
                        color="blue"
                        optionAttribute="name"
                        size="lg"
                      />

                      <UButton
                        :label="$t('close')"
                        color="blue"
                        size="lg"
                        block
                        @click="hide"
                      />
                    </div>
                  </template>
                </VDropdown>
              </div>
            </template>

            <LazyStatChartView
              :key="baseStorageKey"
              :categories="categories"
              :chartType="chartType"
              :markedArea="date"
              :periodName="period"
              :series="series"
              :config
              class="bg-item-4 rounded-lg h-52"
              @click="onClickChart"
            />
          </UiToggle>
        </div>

        <div class="grid @4xl/stat:grid-cols-[1.4fr,auto] @4xl/stat:gap-4 gap-2">
          <!-- Categories first level -->
          <UiToggle
            v-if="selectedTrnsIdsForTrnsList && selectedTrnsIdsForTrnsList?.length > 0"
            :class="{
              'md:max-w-4xl': catsView === 'round',
              'md:max-w-lg': catsView === 'list',
            }"
            :storageKey="`${newBaseStorageKey}-cats-root`"
            :initStatus="true"
            isPadding
          >
            <template #header="{ toggle, isShown }">
              <div class="flex items-center justify-between">
                <UiTitle
                  :class="getStyles('item', ['link', 'center', 'padding3', 'minh', 'minw1', 'rounded'])"
                  class="grow flex items-center gap-2 pb-0 -ml-1"
                  @click="toggle"
                >
                  <Icon
                    v-if="!isShown"
                    name="mdi:chevron-right"
                    size="22"
                    class="-ml-1"
                  />
                  <div>{{ $t('categories.title') }}</div>
                  <div>{{ catsView === 'list' ? cats.length : catsRounded.length }}</div>
                </UiTitle>

                <template v-if="isShown">
                  <VDropdown
                    v-if="isShown && catsView === 'list'"
                    :overflowPadding="12"
                    autoBoundaryMaxSize
                    placement="bottom-start"
                    class="group"
                  >
                    <div
                      :class="getStyles('item', ['link', 'center', 'minh', 'minw1', 'rounded'])"
                      class="justify-center text-xl"
                    >
                      <Icon
                        name="fluent:settings-20-regular"
                        size="24"
                      />
                    </div>

                    <template #popper>
                      <div class="p-1">
                        <UiCheckbox
                          :checkboxValue="isShowLinesChart"
                          title="Show Lines"
                          showCheckbox
                          @onClick="isShowLinesChart = !isShowLinesChart"
                        />
                      </div>
                    </template>
                  </VDropdown>

                  <!-- Folder -->
                  <div
                    v-if="catsView === 'list'"
                    :class="getStyles('item', ['link', 'center', 'minh', 'minw1', 'rounded'])"
                    class="justify-center text-xl"
                    @click="toggleCats"
                  >
                    <Icon
                      :name="isAllCatsOpened ? 'fluent:folder-open-20-regular' : 'fluent:folder-20-regular'"
                      size="24"
                    />
                  </div>

                  <div
                    v-if="catsView === 'round'"
                    :class="getStyles('item', ['link', 'center', 'minh', 'minw1', 'rounded'])"
                    class="justify-center text-xl"
                    @click="isGroupCategoriesByParentRounded = !isGroupCategoriesByParentRounded"
                  >
                    <Icon
                      :name="isGroupCategoriesByParentRounded ? 'material-symbols-light:background-dot-large-outline-sharp' : 'material-symbols-light:background-dot-small-outline-sharp'"
                      size="22"
                    />
                  </div>

                  <div
                    v-if="catsView === 'list'"
                    :class="getStyles('item', ['link', 'center', 'minh', 'minw1', 'rounded'])"
                    class="justify-center text-xl"
                    @click="isGroupCategoriesByParent = !isGroupCategoriesByParent"
                  >
                    <Icon
                      :name="isGroupCategoriesByParent ? 'material-symbols-light:background-dot-large-outline-sharp' : 'material-symbols-light:background-dot-small-outline-sharp'"
                      size="22"
                    />
                  </div>

                  <!-- Cat view -->
                  <div
                    :class="getStyles('item', ['link', 'center', 'minh', 'minw1', 'rounded'])"
                    class="justify-center text-xl"
                    @click="catsView = catsView === 'list' ? 'round' : 'list'"
                  >
                    <Icon
                      :name="catsView === 'list' ? 'fluent:apps-list-20-regular' : 'fluent:equal-circle-20-regular'"
                      size="24"
                    />
                  </div>
                </template>
              </div>
            </template>

            <div
              v-if="cats.length > 0 && catsView === 'round'"
              class="flex flex-wrap gap-1 md:gap-2 pl-1"
            >
              <StatLinesItemRound
                v-for="item in catsRounded"
                :key="item.id"
                class="flex-auto flex-grow-1 w-28"
                :item
                :isShowLinesChart
                :biggestCatNumber
                :isActive="openedCats.includes(item.id) || openedTrns.includes(item.id)"
                @click="onClickCategoryRounded"
              />
            </div>

            <div
              v-if="cats.length > 0 && catsView === 'list'"
              class="pl-0"
            >
              <StatLinesItemLine
                v-for="item in cats"
                :key="item.id"
                :item
                :isShowLinesChart
                :biggestCatNumber
                :isActive="openedCats.includes(item.id) || openedTrns.includes(item.id)"
                @click="onClickCategory"
                @onClickIcon="onClickCategoryRounded"
              >
                <div
                  class="pl-2"
                >
                  <!-- Chart 2 level -->
                  <div
                    v-if="openedCats.includes(item.id) || openedTrns.includes(item.id)"
                  >
                    <StatCategoryChartWrap
                      :categoryId="item.id"
                      :chartPeriodsShown="chartPeriodsShown2"
                      :periodsEmptyTrnsIds
                      :markedArea="date"
                      :period
                      :type="props.type"
                      :trnsIds="props.trnsIds"
                      @click="onClickChart"
                    />
                  </div>

                  <!-- Categories 2 level -->
                  <div
                    v-if="isGroupCategoriesByParent && openedCats.includes(item.id) && getCats(item.trnsIds).length > 1"
                  >
                    <StatLinesItemLine
                      v-for="insideItem in getCats(item.trnsIds)"
                      :key="insideItem.id"
                      :item="insideItem"
                      :isShowLinesChart
                      :isActive="openedTrns.includes(insideItem.id)"
                      :biggestCatNumber
                      @click="onClickCategory"
                    >
                      <div
                        v-if="openedTrns.includes(insideItem.id)"
                        class="pl-0"
                      >
                        <div
                          v-if="openedCats.includes(insideItem.id) || openedTrns.includes(insideItem.id)"
                        >
                          <StatCategoryChartWrap
                            :categoryId="insideItem.id"
                            :chartPeriodsShown="chartPeriodsShown2"
                            :periodsEmptyTrnsIds
                            :markedArea="date"
                            :period
                            :type="props.type"
                            :trnsIds="props.trnsIds"
                            @click="onClickChart"
                          />
                        </div>

                        <!-- Inside: trns -->
                        <UiToggle
                          :storageKey="`${props.storageKey}-${props.type}-${item.id}-trns-in`"
                          class="pl-4"
                        >
                          <template #header="{ toggle, isShown }">
                            <UiTitle3
                              :class="getStyles('item', ['link', 'center', 'padding3', 'minh', 'minw1', 'rounded'])"
                              class="grow flex items-center gap-2 pb-0"
                              @click="toggle"
                            >
                              <Icon
                                :name="isShown ? 'mdi:chevron-down' : 'mdi:chevron-right'"
                                size="22"
                                class="-ml-3"
                              />
                              <div>{{ $t('trns.title') }}</div>
                              <div>{{ getTrnsWithDate(insideItem.id).length }}</div>
                            </UiTitle3>
                          </template>

                          <TrnsList
                            class="pl-8"
                            :trnsIds="getTrnsWithDate(insideItem.id) ?? []"
                            :size="5"
                            alt2
                            isHideDates
                            isShowFilterByDesc
                          />
                        </UiToggle>
                      </div>
                    </StatLinesItemLine>
                  </div>

                  <div
                    v-if="openedCats.includes(item.id) || openedTrns.includes(item.id)"
                  >
                    <UiToggle
                      :storageKey="`${props.storageKey}-${props.type}-${item.id}-trns`"
                    >
                      <template #header="{ toggle, isShown }">
                        <UiTitle3
                          :class="getStyles('item', ['link', 'center', 'padding3', 'minh', 'minw1', 'rounded'])"
                          class="grow flex items-center gap-2 pb-0"
                          @click="toggle"
                        >
                          <Icon
                            :name="isShown ? 'mdi:chevron-down' : 'mdi:chevron-right'"
                            size="22"
                            class="-ml-3"
                          />
                          <div>{{ $t('trns.title') }}</div>
                          <div>{{ getTrnsWithDate(item.id)?.length }}</div>
                        </UiTitle3>
                      </template>

                      <TrnsList
                        class="pl-8"
                        :trnsIds="getTrnsWithDate(item.id) ?? []"
                        :size="5"
                        alt2
                        isHideDates
                        isShowFilterByDesc
                      />
                    </UiToggle>
                  </div>
                </div>
              </StatLinesItemLine>
            </div>
          </UiToggle>

          <!-- Trns first level -->
          <UiToggle
            v-if="selectedTrnsIdsForTrnsList && selectedTrnsIdsForTrnsList?.length > 0"
            :storageKey="`${newBaseStorageKey}-trns-root`"
            class="@xl/stat:min-w-96 max-w-lg"
            isPadding
          >
            <template #header="{ toggle, isShown }">
              <UiTitle
                :class="getStyles('item', ['link', 'center', 'padding3', 'minh', 'minw1', 'rounded'])"
                class="grow flex items-center gap-2 -ml-1"
                @click="toggle"
              >
                <Icon
                  v-if="!isShown"
                  name="mdi:chevron-right"
                  size="22"
                  class="-ml-1"
                />
                <div>{{ $t('trns.title') }}</div>
                <div>{{ selectedTrnsIdsForTrnsList?.length }}</div>
              </UiTitle>
            </template>

            <TrnsList
              class="pl-1"
              :groupedBy="period"
              :isShowGroupSum="period !== 'day'"
              :trnsIds="selectedTrnsIdsForTrnsList"
              isShowFilterByDesc
              isShowHeader2
            />
          </UiToggle>
        </div>

        <!-- Empty -->
        <div
          v-if="selectedTrnsIdsForTrnsList?.length === 0"
          class="flex-col gap-2 flex-center h-full py-3 text-center text-secondary"
        >
          <UiIconBase name="mdi mdi-palm-tree" class="!text-3xl" />
          <div class="text-md">
            {{ $t("trns.noTrns") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
