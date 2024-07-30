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
import { getTrnsIds } from '~/components/trns/getTrns'

const props = defineProps<{
  isQuickModal?: boolean
  quickModalCategoryId?: CategoryId
  storageKey?: string
  trnsIds: TrnId[]
  type: MoneyTypeSlugSum
}>()

const maxRange = computed(() => useTrnsStore().getRange(props.trnsIds))

const { addInterval, getPeriodsWithEmptyTrnsIds2, grouped, interval, intervalGroups, range, removeInterval, setRange, setRangeByCalendar, setRangeByPeriod } = useDateRange({
  key: `${props.type}${props.storageKey}`,
})

const selectedType = ref<MoneyTypeSlugSum>('sum')
const onSelectType = (type: MoneyTypeSlugSum) => selectedType.value = type === selectedType.value ? 'sum' : type

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

const newBaseStorageKey = computed(() => `${grouped.value.period}-${props.storageKey}-${JSON.stringify(filter.catsIds.value)}`)
const baseStorageKey = computed(() => `${grouped.value.period}-${props.storageKey}-${JSON.stringify(filter.catsIds.value)}`)
const isShowLinesChart = useStorage<boolean>(`${newBaseStorageKey.value}-isShowLinesChart`, false)

const chartType = useStorage<ChartType>(`${newBaseStorageKey.value}-chartType`, 'bar')

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
const isGroupCategoriesByParent = useStorage<boolean>(`${newBaseStorageKey.value}-isGroupCategoriesByParent`, true)
const isGroupCategoriesByParentRounded = useStorage<boolean>(`${newBaseStorageKey.value}-isGroupCategoriesByParentRounded`, true)

const cats = computed(() => getCats(trnsIdsForTotals.value ?? [], isGroupCategoriesByParent.value))
const catsRounded = computed(() => getCats(selectedTrnsIdsForTrnsList.value ?? [], isGroupCategoriesByParentRounded.value))

const biggestCatNumber = computed(() => cats.value.at(0)?.value ?? 0)

const isOpenedAll = useStorage<boolean>(`${newBaseStorageKey.value}-isOpenedAll`, false)
const openedCats = useStorage<CategoryId[]>(`${newBaseStorageKey.value}-openedCats`, [])
const openedTrns = useStorage<CategoryId[]>(`${newBaseStorageKey.value}-openedTrns`, [])
const catsView = useStorage<'list' | 'round'>(`${newBaseStorageKey.value}-catsView`, 'list')

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

function onClickCategoryRounded(categoryId: CategoryId) {
  filter.clearFilter()
  filter.setCategoryId(categoryId)
}

const isShowDateSelector = ref(false)
const isShowTrns = ref(false)

const quickModalCategoryId = ref<CategoryId | false>(false)

function onClickCategory(categoryId: CategoryId) {
  quickModalCategoryId.value = quickModalCategoryId.value === categoryId ? false : categoryId
}

const isShowChilds = useStorage<boolean>(`${newBaseStorageKey.value}-isShowChilds`, false)
</script>

<template>
  <div>
    <!-- Stat -->
    <div class="@container/stat px-2 pt-2 max-w-4xl">
      <div class="">
        <div class="">
          <div class="flex justify-between">
            <!-- Chart types -->
            <div class="flex gap-1">
              <DateLinkItem2 :isActive="chartType === 'bar'" @click="chartType = 'bar'">
                {{ t('chart.types.bar') }}
              </DateLinkItem2>

              <DateLinkItem2 :isActive="chartType === 'line'" @click="chartType = 'line'">
                {{ t('chart.types.line') }}
              </DateLinkItem2>
            </div>

            <div class="flex gap-1">
              <DateLinkItem2 :isActive="grouped.period === 'day'" @click="grouped.period = 'day'">
                {{ $t(`dates.day.simple`) }}
              </DateLinkItem2>

              <DateLinkItem2 :isActive="grouped.period === 'week'" @click="grouped.period = 'week'">
                {{ $t(`dates.week.simple`) }}
              </DateLinkItem2>

              <DateLinkItem2 :isActive="grouped.period === 'month'" @click="grouped.period = 'month'">
                {{ $t(`dates.month.simple`) }}
              </DateLinkItem2>
            </div>
          </div>

          <StatChartView2
            :key="baseStorageKey"
            :categories
            :chartType
            :period="grouped.period"
            :series
            class="!h-40 px-2"
            @click="onClickChart"
          />

          <div class="flex items-end justify-between pt-2 pb-2 gap-2">
            <UiTitle7
              @click="isShowDateSelector = !isShowDateSelector"
            >
              <DateViewRange
                v-if="selectedPeriod !== -1"
                :range="groupedPeriods2[selectedPeriod]"
                title="selectedPeriod"
              />
              <div v-else>
                {{ `${$t('dates.last')} ${interval.duration} ${$t(`dates.${interval.period}.simple`)}` }}
              </div>
            </UiTitle7>

            <div class="flex gap-1">
              <DateNavHome
                v-if="selectedPeriod !== -1 || range.start !== dayjs().subtract(interval.duration - 1, interval.period).startOf(interval.period).valueOf() && range.end !== dayjs().endOf(interval.period).valueOf()"
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

          <!-- Stat sum -->
          <div>
            <div
              v-if="props.type === 'sum'"
              class="flex gap-1 flex-wrap justify-stretch"
            >
              <StatSum
                :amount="-totals.expense"
                :isActive="selectedType === 'expense'"
                type="expense"
                :class="[...getStyles('item', ['link', 'bg', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
                class="grow md:grow-0 !-bg-red-600/10"
                @click="onSelectType('expense')"
              />
              <StatSum
                :amount="totals.income"
                :isActive="selectedType === 'income'"
                :class="[...getStyles('item', ['link', 'bg', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
                type="income"
                class="grow md:grow-0 !-bg-green-600/10"
                @click="onSelectType('income')"
              />
              <StatSum
                :amount="totals.sum"
                :class="[...getStyles('item', ['link', 'bg', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
                type="sum"
                class="grow md:grow-0"
                @click="isShowTrns = true"
              />
            </div>

            <StatSum
              v-else
              :class="[...getStyles('item', ['-link', 'bg', 'padding3', 'center', 'minh', 'minw1', 'rounded'])]"
              :amount="totals[props.type]"
              :type="props.type"
            />
          </div>
        </div>

        <!-- Content -->
        <div class="grid @3xl/stat:grid-cols-[2fr,1fr] @xl/stat:gap-8 gap-2 pt-3">
          <!-- Categories first level -->
          <UiToggle
            v-if="(isQuickModal ? (cats.length > 1 || (props.quickModalCategoryId && categoriesStore.hasChildren(props.quickModalCategoryId))) : selectedTrnsIdsForTrnsList && selectedTrnsIdsForTrnsList?.length > 0)"
            :storageKey="`${newBaseStorageKey}-cats-root`"
            :initStatus="true"
          >
            <template #header="{ toggle, isShown }">
              <div class="flex items-center justify-between">
                <UiTitle8 :isShown @click="toggle">
                  {{ $t('categories.title') }} {{ catsView === 'list' ? cats.length : catsRounded.length }}
                </UiTitle8>
                <StatCategoriesButtons
                  v-if="isShown"
                  :catsView
                  :isShowLinesChart
                  :isShowChilds
                  :isGroupCategoriesByParentRounded
                  :isGroupCategoriesByParent
                  @toggleChart="isShowLinesChart = !isShowLinesChart"
                  @toggleCats="isShowChilds = !isShowChilds"
                  @toggleGroupByParentList="isGroupCategoriesByParent = !isGroupCategoriesByParent"
                  @toggleGroupByParentRounded="isGroupCategoriesByParentRounded = !isGroupCategoriesByParentRounded"
                  @toggleCatView="catsView = catsView === 'list' ? 'round' : 'list'"
                />
              </div>
            </template>

            <!-- List -->

            <div
              v-if="cats.length > 0 && catsView === 'list'"
              class="md:max-w-sm"
            >
              <StatLinesItemLine
                v-for="item in cats"
                :key="item.id"
                :item
                :isShowLinesChart
                :isGroupCategoriesByParent
                :biggestCatNumber
                isAltIcon
                :isActive="openedCats.includes(item.id) || openedTrns.includes(item.id)"
                :class="{ 'pb-3': isGroupCategoriesByParent && isShowChilds }"
                @click="onClickCategory"
                @onClickIcon="onClickCategoryRounded"
              >
                <div v-if="isGroupCategoriesByParent && isShowChilds" class="pl-10 -grid flex flex-wrap gap-1">
                  <StatLinesItemRound2
                    v-for="itemInside in getCats(item.trnsIds)"
                    :key="itemInside.id"
                    :item="itemInside"
                    @click="onClickCategory"
                  />
                </div>
              </StatLinesItemLine>
            </div>

            <!-- class="flex flex-wrap gap-1 md:gap-2 pl-1" -->
            <div
              v-if="cats.length > 0 && catsView === 'round'"
              class="flex flex-wrap gap-1"
            >
              <StatLinesItemRound
                v-for="item in catsRounded"
                :key="item.id"
                :item
                :isShowLinesChart
                :biggestCatNumber
                :isActive="openedCats.includes(item.id) || openedTrns.includes(item.id)"
                @click="onClickCategoryRounded"
              />
            </div>
          </UiToggle>

          <!-- Opened quick modal with 1 category -->
          <template v-else>
            <TrnsList
              :trnsIds="selectedTrnsIdsForTrnsList"
              class="px-2 py-2"
              isShowFilterByDesc
              isShowFilterByType
              isShowGroupSum
              isShowGroupSumByDate
              isShowHeader
            />
          </template>

          <UiToggle
            v-if="(isQuickModal ? (cats.length > 1 || (props.quickModalCategoryId && categoriesStore.hasChildren(props.quickModalCategoryId))) : selectedTrnsIdsForTrnsList && selectedTrnsIdsForTrnsList?.length > 0)"
            :storageKey="`${newBaseStorageKey}-${props.type}trns-all`"
            :initStatus="false"
            class="min-w-80"
          >
            <template #header="{ toggle, isShown }">
              <div class="flex items-center justify-between">
                <UiTitle8 :isShown @click="toggle">
                  {{ $t('trns.title') }} {{ selectedTrnsIdsForTrnsList.length }}
                </UiTitle8>
              </div>
            </template>

            <TrnsList
              :trnsIds="selectedTrnsIdsForTrnsList"
              class="py-2 max-w-sm"
              isShowFilterByDesc
              isShowFilterByType
              isShowGroupSum
              isShowGroupSumByDate
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

    <Teleport to="#teleports">
      <!-- Date Selector -->
      <BaseBottomSheet2
        v-if="isShowDateSelector"
        isShow
        drugClassesCustom="bg-foreground-2 max-w-xl md:mb-12 rounded-xl"
        @closed="isShowDateSelector = false"
      >
        <template #handler="{ close }">
          <BaseBottomSheetHandler />
          <BaseBottomSheetClose @onClick="close" />
        </template>

        <template #default="{ close }">
          <div class="grid gap-4 p-3 overflow-hidden h-full overflow-y-auto">
            <UiTitle7>{{ t('select') }}</UiTitle7>

            <div class="grid items-start gap-6">
              <div class="grid gap-2">
                <div class="grid grid-cols-[auto,1fr,auto] gap-2">
                  <DateLinkItem @click="removeInterval">
                    -
                  </DateLinkItem>
                  <DateLinkItem
                    @click="setRangeByPeriod({ grouped, interval })"
                  >
                    {{ `Last ${interval.duration} ${interval.period}` }}
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

              <div class="grid gap-1">
                <div class="flex gap-2">
                  <DateLinkItem @click="--grouped.duration">
                    -
                  </DateLinkItem>

                  <DateLinkItem
                    @click="() => grouped = {
                      duration: grouped.duration,
                      period: grouped.period,
                    }"
                  >
                    {{ `Grouped by ${grouped.duration} ${grouped.period}` }}
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

            <UiButtonBlue @click="close">
              {{ $t('close') }}
            </UiButtonBlue>
          </div>
        </template>
      </BaseBottomSheet2>

      <!-- Categories stat -->
      <BaseBottomSheet2
        v-if="quickModalCategoryId"
        isShow
        drugClassesCustom="bg-foreground-2 lg:w-[calc(100%-120px)] max-w-4xl"
        @closed="quickModalCategoryId = false"
      >
        <template #handler="{ close }">
          <div class="relative z-20">
            <BaseBottomSheetHandler />
            <BaseBottomSheetClose @onClick="close" />
          </div>
        </template>

        <template #default="">
          <div class="grid h-[98dvh] content-start overflow-hidden overflow-y-auto scrollerBlock">
            <CategoriesPageHeader
              :category="categoriesStore.items[quickModalCategoryId]"
              :parentCategory="categoriesStore.items?.[categoriesStore.items[quickModalCategoryId]?.parentId]"
              class="sticky top-0 bg-foreground-5 z-10"
            />

            <StatMiniItem
              :quickModalCategoryId
              :storageKey="`${props.storageKey}sum-in-${quickModalCategoryId}`"
              :trnsIds="getTrnsIds({
                categoriesIds: categoriesStore.getChildsIdsOrParent(quickModalCategoryId),
                trnsItems: trnsStore.items,
              })"
              class="-max-w-2xl"
              isQuickModal
              type="sum"
            />
          </div>
        </template>
      </BaseBottomSheet2>

      <!-- Trns -->
      <BaseBottomSheet2
        v-if="selectedTrnsIdsForTrnsList && selectedTrnsIdsForTrnsList?.length > 0 && isShowTrns"
        isShow
        drugClassesCustom="-max-w-sm mx-auto bg-foreground-2"
        @closed="isShowTrns = false"
      >
        <template #handler="{ close }">
          <div class="relative z-20">
            <BaseBottomSheetHandler />
            <BaseBottomSheetClose @onClick="close" />
          </div>
        </template>

        <template #default="{ close }">
          <div class="grid h-[98dvh] content-start overflow-hidden overflow-y-auto scrollerBlock">
            <TrnsList
              :trnsIds="selectedTrnsIdsForTrnsList"
              class="px-2 py-2"
              isShowFilterByDesc
              isShowFilterByType
              isShowGroupSum
              isShowGroupSumByDate
              isShowHeader
            />
          </div>
        </template>
      </BaseBottomSheet2>
    </Teleport>
  </div>
</template>
