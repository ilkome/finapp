<script setup lang="ts">
import dayjs from 'dayjs'
import { useStorage } from '@vueuse/core'
import type { CategoryId } from '../categories/types'
import type { MoneyTypeSlugSum } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import type { ChartType } from '~/components/stat/chart/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { FilterProvider } from '~/components/filter/useFilter'
import { getStyles } from '~/components/ui/getStyles'
import { useNewStat } from '~/components/stat/useNewStat'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useDateRange } from '~/components/date/useDateRange'
import { markArea } from '~/components/stat/chart/utils'
import type { Range } from '~/components/date/types'

const props = defineProps<{
  storageKey?: string
  trnsIds: TrnId[]
  type: MoneyTypeSlugSum
}>()

const maxRange = computed(() => useTrnsStore().getRange(props.trnsIds))

const { addInterval, getPeriodsWithEmptyTrnsIds2, grouped, interval, intervalGroups, range, removeInterval, setRange, setRangeByCalendar, setRangeByPeriod } = useDateRange({
  key: `${props.type}${props.storageKey}`,
})

const selectedType = ref<MoneyTypeSlugSum>('sum')

const filteredTrnsIds = computed(() => {
  if (selectedType.value === 'income') {
    return props.trnsIds
      .filter(trnId => trnsStore.items[trnId].type === 1 || trnsStore.items[trnId].type === 2)
      .sort((a, b) => trnsStore.items[b].date - trnsStore.items[a].date)
  }

  if (selectedType.value === 'expense') {
    return props.trnsIds
      .filter(trnId => trnsStore.items[trnId].type === 0 || trnsStore.items[trnId].type === 2)
      .sort((a, b) => trnsStore.items[b].date - trnsStore.items[a].date)
  }

  return props.trnsIds
})

//   const expenseTrnsIds = computed(() =>
//   props.trnsIds.filter(
//     trnId => trnsStore.items[trnId].type === 0 || trnsStore.items[trnId].type === 2,
//   ).sort(
//     (a, b) => trnsStore.items[b].date - trnsStore.items[a].date,
//   ),
// )

// const incomeTrnsIds = computed(() =>
//   props.trnsIds.filter(
//     trnId => trnsStore.items[trnId].type === 1 || trnsStore.items[trnId].type === 2,
//   ).sort(
//     (a, b) => trnsStore.items[b].date - trnsStore.items[a].date,
//   ),
// )

const filter = inject('filter') as FilterProvider
const { t } = useI18n()
const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()
const { getCats, getSeries2 } = useNewStat()
const categoriesStore = useCategoriesStore()

const groupedPeriods2 = computed(() =>
  getPeriodsWithEmptyTrnsIds2({
    duration: grouped.value.duration || 1,
    period: grouped.value.period,
    range: range.value,
  }),
)

const categories = computed(() => groupedPeriods2.value.map(r => +r.start) ?? [])

const selectedPeriod = ref<number>(-1)

watch(range, () => {
  selectedPeriod.value = -1
})

function onClickChart(idx: number) {
  const newPeriod = idx

  if (selectedPeriod.value === newPeriod) {
    selectedPeriod.value = -1
    return
  }

  selectedPeriod.value = newPeriod
}

const isShowLinesChart = useStorage<boolean>('isShowLinesChart', false)
const newBaseStorageKey = computed(() => `${grouped.value.period}-${props.storageKey}-${JSON.stringify(filter.catsIds.value)}`)
const baseStorageKey = computed(() => `${grouped.value.period}-${props.storageKey}-${JSON.stringify(filter.catsIds.value)}`)

const chartType = useStorage<ChartType>(`${baseStorageKey.value}-chartType`, 'bar')

const groupedTrnsIds = computed(() => getPeriodsWithTrns2(filteredTrnsIds.value, groupedPeriods2.value))
const groupedTrnsIds2 = computed(() => getPeriodsWithTrns2(props.trnsIds, groupedPeriods2.value))
const groupedTrnsTotals2 = computed(() => groupedTrnsIds.value.map(g => getTotalOfTrnsIds(g)))

function getPeriodsWithTrns2(trnsIds: TrnId[], ranges: Range[]) {
  const list = [...ranges.map(() => [])]

  trnsIds.forEach((trnId) => {
    const trnDate = trnsStore.items[trnId]?.date
    const idx = ranges.findIndex(r => trnDate! >= r.start && trnDate! <= r.end)
    list[idx]?.push(trnId)
  })

  return list
}

const series = computed(() => {
  const series = getSeries2(groupedTrnsTotals2.value, props.type, groupedPeriods2.value)

  if (selectedPeriod.value >= 0) {
    if (chartType.value !== 'bar') {
      const markAreaSeriesIdx = series.findIndex(s => s.markedArea === 'markedArea')

      if (markAreaSeriesIdx === -1) {
        series.push({
          data: [],
          markArea: markArea(groupedPeriods2.value?.[selectedPeriod.value]?.start),
          markedArea: 'markedArea',
          type: 'bar',
        })
      }
      else {
        series[markAreaSeriesIdx] = {
          data: [],
          markArea: markArea(groupedPeriods2.value?.[selectedPeriod.value]?.start),
          markedArea: 'markedArea',
          type: 'bar',
        }
      }
    }
    else {
      series[0].markArea = markArea(groupedPeriods2.value?.[selectedPeriod.value]?.start)
    }
  }

  return series
})

const selectedTrnsIdsForTrnsList = computed(() => {
  if (selectedPeriod.value >= 0) {
    return trnsStore.getStoreTrnsIds({
      trnsIds: groupedTrnsIds.value[selectedPeriod.value],
    }, { includesChildCategories: false })
  }

  return trnsStore.getStoreTrnsIds({
    dates: {
      from: range.value.start,
      until: range.value.end,
    },
    trnsIds: filteredTrnsIds.value,
  }, { includesChildCategories: false })
})

const trnsIdsForTotals = computed(() => {
  if (selectedPeriod.value >= 0) {
    return trnsStore.getStoreTrnsIds({
      trnsIds: groupedTrnsIds2.value[selectedPeriod.value],
    }, { includesChildCategories: false })
  }

  return trnsStore.getStoreTrnsIds({
    dates: {
      from: range.value.start,
      until: range.value.end,
    },
    trnsIds: props.trnsIds,
  }, { includesChildCategories: false })
})

const totals = computed(() =>
  getTotalOfTrnsIds(trnsIdsForTotals.value),
)

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
    trnsIds: selectedTrnsIdsForTrnsList.value,
  }, { includesChildCategories: true })
}

const isShowDateSelector = ref(false)
</script>

<template>
  <div>
    <div class="grid gap-3 pt-3 px-3">
      <div class="-my-1">
        <div
          v-if="props.type === 'sum'"
          class="flex"
        >
          <StatSum
            :amount="-totals.expense"
            :isActive="selectedType === 'expense'"
            type="expense"
            @click="selectedType = 'expense'"
          />
          <StatSum
            :amount="totals.income"
            :isActive="selectedType === 'income'"
            type="income"
            @click="selectedType = 'income'"
          />
          <StatSum
            :amount="totals.sum"
            type="sum"
            @click="selectedType = 'sum'"
          />
        </div>

        <StatSum
          v-else
          :amount="totals[props.type]"
          :type="props.type"
        />
      </div>

      <div>
        <div
          class="text-xs font-medium text-secondary"
          @click="isShowDateSelector = !isShowDateSelector"
        >
          <DateViewRange
            v-if="selectedPeriod !== -1"
            :range="groupedPeriods2[selectedPeriod]"
            title="selectedPeriod"
          />

          <DateViewRange v-else :range="range" title="range" />
        </div>

        <div
          v-if="isShowDateSelector"
          class="grid gap-2 bg-item-4 p-2 rounded-md"
        >
          <div class="flex overflow-y-auto gap-1">
            <div class="flex gap-2">
              <DateLinkItem @click="removeInterval">
                -
              </DateLinkItem>
              <DateLinkItem @click="addInterval">
                +
              </DateLinkItem>
            </div>

            <DateRanges
              :range
              :interval
              :grouped
              :maxRange
              @setRangeByPeriod="setRangeByPeriod"
            />

            <DateDaySelector
              :groupBy="grouped.period"
              :range
              @setRangeByCalendar="setRangeByCalendar"
            />
          </div>

          <div class="flex overflow-y-auto gap-1">
            <div class="flex gap-1">
              <div class="flex gap-2">
                <DateLinkItem @click="--grouped.duration">
                  -
                </DateLinkItem>
                <DateLinkItem @click="++grouped.duration">
                  +
                </DateLinkItem>
              </div>

              <DateLinkItem
                v-for="rangeItem in intervalGroups"
                :key="rangeItem.period"
                :isActive="rangeItem.period === grouped.period && rangeItem.duration === grouped.duration"
                @click="() => grouped = rangeItem"
              >
                {{ rangeItem.duration }}{{ rangeItem.period }}
              </DateLinkItem>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stat -->
    <div class="_@3xl/main:grid-cols-[1fr,.8fr] _gap-8 grid @container/stat px-3">
      <div class="grid gap-2">
        <div class="grid @4xl/stat:grid-cols-[1.4fr,auto] @4xl/stat:gap-4">
          <!-- Chart first level -->
          <StatChartView2
            :key="baseStorageKey"
            :categories
            :chartType
            :period="grouped.period"
            :series
            @click="onClickChart"
          />
        </div>
        <div class="flex items-center justify-between pt-2">
          <div class="flex gap-2">
            <div
              :class="[
                getStyles('item', ['link', 'minh2']), {
                  'bg-item-5 rounded': chartType === 'bar',
                },
              ]"
              class="flex items-center px-3 py-0 text-xs bg-item-4 rounded-full leading-none font-primary text-nowrap"
              @click="chartType = 'bar'"
            >
              {{ t('chart.types.bar') }}
            </div>
            <div
              :class="[
                getStyles('item', ['link', 'minh2']), {
                  'bg-item-5 rounded': chartType === 'line',
                },
              ]"
              class="flex items-center px-3 py-0 text-xs bg-item-4 rounded-full leading-none font-primary text-nowrap"
              @click="chartType = 'line'"
            >
              {{ t('chart.types.line') }}
            </div>
          </div>

          <div class="flex gap-1">
            <DateNavHome
              v-if="range.start !== dayjs().subtract(interval.duration - 1, interval.period).startOf(interval.period).valueOf() && range.end !== dayjs().endOf(interval.period).valueOf()"
              :interval
              @setRange="setRange"
            />

            <DateNav
              v-if="range.start !== maxRange.start && range.end !== maxRange.end"
              :interval
              :maxRange
              :range
              @setRange="setRange"
            />
          </div>
        </div>

        <div class="grid @3xl/stat:grid-cols-[1.3fr,auto] @xl/stat:gap-12 gap-2">
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
              class="grid gap-2"
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
                        <TrnsList
                          class="pl-8"
                          :trnsIds="getTrnsWithDate(insideItem.id) ?? []"
                          :size="5"
                          alt2
                          isHideDates
                          isShowFilterByDesc
                        />
                        <!-- Inside: trns -->
                      </div>
                    </StatLinesItemLine>
                  </div>

                  <div
                    v-if="openedCats.includes(item.id) || openedTrns.includes(item.id)"
                  >
                    <TrnsList
                      class="pl-8"
                      :trnsIds="getTrnsWithDate(item.id) ?? []"
                      :size="5"
                      alt2
                      isHideDates
                      isShowFilterByDesc
                    />
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
              :isShowGroupSum="grouped.period !== 'day'"
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
