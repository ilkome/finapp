<script setup lang="ts">
import _sortby from 'lodash.sortby'
import defu from 'defu'
import { useStorage } from '@vueuse/core'
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { DeepPartial } from '~~/utils/types'
import type { FilterProvider } from '~/components/filter/types'
import type { Range, StatDateProvider } from '~/components/date/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { MoneyTypeSlugNew, TotalCategory, ViewOptions } from '~/components/stat/types'
import type { TotalReturns } from '~/components/amount/getTotal'
import type { TrnId } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import { ViewOptionsSchema, defaultViewOptions } from '~/components/stat/config'
import { getTrnsIds } from '~/components/trns/getTrns'
import { markArea } from '~/components/stat/chart/utils'
import { seriesOptions } from '~/components/stat/chart/config2'
import { sortCategoriesByAmount } from '~/components/stat/utils'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  hasChildren: boolean
  isOneCategory?: boolean
  isQuickModal?: boolean
  preCategoriesIds?: CategoryId[]
  quickModalCategoryId?: CategoryId
  storageKey?: string
  trnsIds: TrnId[]
  type: MoneyTypeSlugNew
}>()

const { t } = useI18n()
const filter = inject('filter') as FilterProvider
const statDate = inject('statDate') as StatDateProvider
const statConfig = inject('statConfig') as StatConfigProvider

const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()
const categoriesStore = useCategoriesStore()

const isShowDateSelector = ref(false)
const isShowTrns = ref(false)

const maxRange = computed(() => trnsStore.getRange(props.trnsIds))
const newBaseStorageKey = computed(() => `finapp-${statDate.params.value.intervalsBy}-${props.storageKey}-${JSON.stringify(filter?.catsIds?.value)}`)

const selectedType = ref<MoneyTypeSlugNew>('sum')
function onSelectType(type: MoneyTypeSlugNew) {
  if (type === 'sum') {
    isShowTrns.value = !isShowTrns.value
    return
  }

  selectedType.value = type === selectedType.value ? 'sum' : type
}

const typesInTrnsIds = computed(() => ({
  expense: props.trnsIds.some(id => trnsStore.items[id].type === 0),
  income: props.trnsIds.some(id => trnsStore.items[id].type === 1),
}))

// TODO: create function for this
const filteredTrnsIds = computed(() => {
  if (selectedType.value === 'income') {
    return getTrnsIds({
      trnsIds: props.trnsIds,
      trnsItems: trnsStore.items ?? {},
      trnsTypes: [1, 2],
    })
  }

  if (selectedType.value === 'expense') {
    return getTrnsIds({
      trnsIds: props.trnsIds,
      trnsItems: trnsStore.items ?? {},
      trnsTypes: [0, 2],
    })
  }

  return props.trnsIds
})

const isDayToday = computed(() => (statDate.params.value.rangeBy === 'day' && statDate.params.value.rangeDuration === 1) || (statDate.params.value.intervalSelected !== -1 && statDate.params.value.intervalsBy === 'day'))

/**
 * View Options
 */
const viewOptions = useStorage<ViewOptions>(`${newBaseStorageKey.value}-viewOptions`, {
  ...defaultViewOptions,
  catsList: {
    ...defaultViewOptions.catsList,
    isGrouped: false,
  },
})

function changeViewOptions(newViewOptions: DeepPartial<ViewOptions>) {
  viewOptions.value = defu(newViewOptions, viewOptions.value)
}

onBeforeMount(() => {
  if (!ViewOptionsSchema.safeParse(viewOptions.value).success) {
    viewOptions.value = { ...defaultViewOptions }
  }

  if (props.hasChildren) {
    viewOptions.value.catsList.isGrouped = false
    viewOptions.value.catsRound.isGrouped = false
  }

  if (props.isOneCategory) {
    viewOptions.value.catsList.isGrouped = false
    viewOptions.value.catsRound.isGrouped = false
  }
})

function getCats(trnsIds: TrnId[], isintervalsByParent?: boolean, preCategoriesIds?: CategoryId[]) {
  const categoriesWithTrns = trnsIds?.reduce(
    (acc, trnId) => {
      let newCategoryId = trnsStore.items[trnId]?.categoryId
      if (!newCategoryId)
        return acc

      if (categoriesStore.transferCategoriesIds.includes(newCategoryId))
        return acc

      if (isintervalsByParent) {
        const trnBaseCategory: CategoryItem = categoriesStore.items[newCategoryId]

        newCategoryId = trnBaseCategory?.parentId === 0
          ? trnsStore.items[trnId]?.categoryId
          : trnBaseCategory?.parentId
      }

      acc[newCategoryId] ??= []
      acc[newCategoryId].push(trnId)
      return acc
    },
    {} as Record<CategoryId, TrnId[]>,
  )

  const categories = Object.keys(categoriesWithTrns)
    .reduce(
      (acc, categoryId) => {
        const totalInCategory = getTotalOfTrnsIds(categoriesWithTrns[categoryId]!)
        const trnsIdsInCategory = categoriesWithTrns[categoryId]!

        acc.push({
          id: categoryId,
          trnsIds: trnsIdsInCategory,
          value: totalInCategory.sum,
        })
        return acc
      },
      [] as TotalCategory[],
    )
    .sort((a, b) => sortCategoriesByAmount(a, b))

  if (preCategoriesIds && preCategoriesIds.length > 0) {
    preCategoriesIds.forEach((id) => {
      if (!categoriesWithTrns[id]) {
        categories.push({
          id,
          trnsIds: [],
          value: 0,
        })
      }
    })
  }
  return categories
}

function getSeries(
  total: TotalReturns[],
  type: MoneyTypeSlugNew,
  ranges: Range[],
) {
  const types = type === 'sum' ? ['expense', 'income'] : [type]

  return types.map((t, idx) => ({
    color: seriesOptions[t].color,
    cursor: 'default',
    data: total.map(i => t !== 'sum' ? Math.abs(i[t]) : i[t]),
    name: ranges[idx]?.start,
    type: seriesOptions[t].type,
  }))
}
/**
 * Chart
 */
const xAxisLabels = computed(() => statDate.groupedPeriods.value.map(r => +r.start) ?? [])

const groupedTrnsIds = computed(() => getPeriodsWithTrns(filteredTrnsIds.value, statDate.groupedPeriods.value))
const groupedTrnsIds2 = computed(() => getPeriodsWithTrns(props.trnsIds, statDate.groupedPeriods.value))
const groupedTrnsTotals = computed(() => groupedTrnsIds.value.map(g => getTotalOfTrnsIds(g)))

function getPeriodsWithTrns(trnsIds: TrnId[], ranges: Range[]) {
  const list = [...ranges.map(() => [])]

  trnsIds.forEach((trnId) => {
    const trnDate = trnsStore.items[trnId]?.date
    const idx = ranges.findIndex(r => trnDate! >= r.start && trnDate! <= r.end)
    list[idx]?.push(trnId)
  })

  return list
}

const series = computed(() => {
  const series = getSeries(groupedTrnsTotals.value, props.type, statDate.groupedPeriods.value)

  if (statDate.params.value.intervalSelected >= 0) {
    if (statConfig.config.value?.chartType !== 'bar') {
      const markAreaSeriesIdx = series.findIndex(s => s.markedArea === 'markedArea')

      if (markAreaSeriesIdx === -1) {
        series.push({
          data: [],
          markArea: markArea(statDate.groupedPeriods.value?.[statDate.params.value.intervalSelected]?.start),
          markedArea: 'markedArea',
          type: 'bar',
        })
      }
      else {
        series[markAreaSeriesIdx] = {
          data: [],
          markArea: markArea(statDate.groupedPeriods.value?.[statDate.params.value.intervalSelected]?.start),
          markedArea: 'markedArea',
          type: 'bar',
        }
      }
    }
    else {
      series[0].markArea = markArea(statDate.groupedPeriods.value?.[statDate.params.value.intervalSelected]?.start)
    }
  }

  return series
})

const trnsIdsWithRange = computed(() => trnsStore.getStoreTrnsIds({
  categoriesIds: filter?.catsIds?.value,
  dates: {
    from: statDate.range.value.start,
    until: statDate.range.value.end,
  },
  trnsIds: filteredTrnsIds.value,
  walletsIds: filter?.walletsIds?.value,
}, { includesChildCategories: false }),
)

const selectedTrnsIdsForTrnsList = computed(() => {
  if (statDate.params.value.intervalSelected >= 0) {
    return trnsStore.getStoreTrnsIds({
      categoriesIds: filter?.catsIds?.value,
      trnsIds: groupedTrnsIds.value[statDate.params.value.intervalSelected],
      walletsIds: filter?.walletsIds?.value,
    }, { includesChildCategories: false })
  }

  return trnsIdsWithRange.value
})

const trnsIdsForTotals = computed(() => {
  if (statDate.params.value.intervalSelected >= 0) {
    return trnsStore.getStoreTrnsIds({
      trnsIds: groupedTrnsIds2.value[statDate.params.value.intervalSelected],
    }, { includesChildCategories: false })
  }

  return trnsStore.getStoreTrnsIds({
    dates: {
      from: statDate.range.value.start,
      until: statDate.range.value.end,
    },
    trnsIds: props.trnsIds,
  }, { includesChildCategories: false })
})

const totals = computed<TotalReturns>(() => getTotalOfTrnsIds(trnsIdsForTotals.value))

/**
 * Cats
 */
const cats = computed(() => {
  let cats: CategoryId[] = []
  if (statConfig.config.value?.isShowEmptyCategories && props.preCategoriesIds) {
    cats.push(...props.preCategoriesIds)
  }
  else if (props.preCategoriesIds) {
    cats = [...props.preCategoriesIds]
  }

  cats = _sortby(cats, (id: CategoryId) => [
    categoriesStore.items[categoriesStore.items[id]?.parentId]?.name || false,
    categoriesStore.items[id]?.name,
  ])

  return getCats(selectedTrnsIdsForTrnsList.value ?? [], viewOptions.value.catsList.isGrouped, cats)
})

const catsRounded = computed(() => {
  let cats: CategoryId[] = [...(props.preCategoriesIds ?? [])]
  if (!viewOptions.value.catsRound.isGrouped && viewOptions.value.catsRound.isShowFavorites) {
    cats.push(...categoriesStore.favoriteCategoriesIds)
  }
  if (!viewOptions.value.catsRound.isGrouped && viewOptions.value.catsRound.isShowRecent) {
    cats.push(...categoriesStore.recentCategoriesIds)
  }

  cats = _sortby(cats, (id: CategoryId) => [
    categoriesStore.items[categoriesStore.items[id]?.parentId]?.name || false,
    categoriesStore.items[id]?.name,
  ])

  return getCats(selectedTrnsIdsForTrnsList.value ?? [], viewOptions.value.catsRound.isGrouped, cats)
})

const biggestCatNumber = computed(() => {
  const income = cats.value.filter(c => c.value > 0).at(0)?.value ?? 0
  const expense = cats.value.filter(c => c.value < 0).at(0)?.value ?? 0

  return {
    expense,
    income,
  }
})

const openedCats = useStorage<CategoryId[]>(`${newBaseStorageKey.value}-openedCats`, [])
const openedTrns = useStorage<CategoryId[]>(`${newBaseStorageKey.value}-openedTrns`, [])

const quickModalCategoryId = ref<CategoryId | false>(false)

async function onClickCategory(categoryId: CategoryId) {
  await filter.setCategoryId(categoryId)
  await nextTick()

  const queryParams = new URLSearchParams([
    ...Object.entries(statDate.params.value).map(([key, value]) => [key, String(value)]),
    ...filter?.walletsIds?.value.map(id => ['walletsIds', id]),
  ],
  ).toString()

  useRouter().push(`/stat/category/${categoryId}?${queryParams}`)
}

const quickModalTrnsIds = computed(() => {
  if (quickModalCategoryId.value) {
    return trnsStore.getStoreTrnsIds({
      categoriesIds: [...categoriesStore.getChildsIdsOrParent(quickModalCategoryId.value), ...filter?.catsIds?.value],
      walletsIds: filter?.walletsIds?.value,
    })
  }

  return []
})
</script>

<template>
  <div>
    <div class="@container/stat px-2 pt-2">
      <!-- Chart -->
      <StatChartWrap
        :isShowDateSelector
        :maxRange
        :series
        :xAxisLabels
        @update:isShowDateSelector="(value: boolean) => isShowDateSelector = value"
      />

      <!-- Stat sum -->
      <StatSumWrap
        :isShowExpense="typesInTrnsIds.expense"
        :isShowIncome="typesInTrnsIds.income"
        :selectedType
        :totals
        :type="props.type"
        :typesInTrnsIds
        @onClickSum="onSelectType"
      />

      <!-- Content -->
      <div class="grid gap-6 pt-4">
        <!-- Categories first level -->
        <UiToggle
          v-if="props.hasChildren"
          :storageKey="`${newBaseStorageKey}-${props.type}-cats`"
          :initStatus="true"
          class="min-w-80 md:max-w-lg"
        >
          <template #header="{ toggle, isShown }">
            <div class="flex items-center justify-between md:max-w-lg">
              <UiTitle8 :isShown @click="toggle">
                {{ t('categories.title') }} {{ (!isShown && cats.length > 0) ? cats.length : '' }}
              </UiTitle8>

              <StatCategoriesButtons
                v-if="isShown"
                :viewOptions
                :isShowGrouping="!isOneCategory"
                @changeViewOptions="changeViewOptions"
              />
            </div>
          </template>

          <!-- Lines -->
          <div
            v-if="cats.length > 0 && viewOptions.catsView === 'list'"
            :class="{
              'grid gap-2 px-0': viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened,
              'md:max-w-lg': !viewOptions.catsList.isGrouped || !viewOptions.catsList.isOpened,
              'grid gap-1': viewOptions.catsList.isItemsBg,
            }"
            class="pt-2"
          >
            <StatLinesItemLine
              v-for="item in cats"
              :key="item.id"
              :biggestCatNumber
              :class="{ 'bg-item-9 overflow-hidden rounded-lg': viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened }"
              :isActive="openedCats.includes(item.id) || openedTrns.includes(item.id)"
              :isHideDots="viewOptions.catsList.isOpened"
              :item
              :isHideParent="props.hasChildren"
              :lineWidth="((viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened) || viewOptions.catsList.isLines) ? 0 : 1"
              :viewOptions
              @click="onClickCategory"
            >
              <div
                v-if="viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened"
                class="flex flex-wrap gap-1 pb-3 pl-2 pt-1"
              >
                <StatLinesItemRound
                  v-for="itemInside in getCats(item.trnsIds)"
                  :key="itemInside.id"
                  :item="itemInside"
                  @click="onClickCategory"
                />
              </div>
            </StatLinesItemLine>
          </div>

          <!-- <div class="flex gap-3 overflow-y-auto">
            <StatLinesCategoryVertical
              v-for="item in cats"
              :key="item.id"
              :biggestCatNumber
              :class="{ 'bg-item-9 overflow-hidden rounded-lg': viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened }"
              :isActive="openedCats.includes(item.id) || openedTrns.includes(item.id)"
              :isHideDots="viewOptions.catsList.isOpened"
              :item
              :isHideParent="props.hasChildren"
              :lineWidth="((viewOptions.catsList.isGrouped && viewOptions.catsList.isOpened) || viewOptions.catsList.isLines) ? 0 : 1"
              :viewOptions
              @click="onClickCategory"
            />
          </div> -->

          <!-- Rounds -->
          <div
            v-if="catsRounded.length > 0 && viewOptions.catsView === 'round'"
            class="@3xl/stat:gap-2 flex flex-wrap gap-1 gap-y-2 pl-1 pt-2 md:max-w-lg"
          >
            <StatLinesItemRound
              v-for="item in catsRounded"
              :key="item.id"
              :item
              :biggestCatNumber
              :isActive="openedCats.includes(item.id) || openedTrns.includes(item.id)"
              isShowAmount
              @click="onClickCategory"
            />
          </div>
        </UiToggle>

        <!-- <div v-if="props.hasChildren">
          <div class="flex items-center justify-between md:max-w-lg">
            <UiTitle82>
              {{ t('categories.title') }}
            </UiTitle82>

            <StatCategoriesButtons
              :viewOptions
              @changeViewOptions="changeViewOptions"
            />
          </div>
        </div> -->

        <!-- Trns -->
        <UiToggle
          v-if="selectedTrnsIdsForTrnsList.length > 0"
          :storageKey="`${newBaseStorageKey}-${props.type}trns-all`"
          :initStatus="true"
          class="min-w-80 md:max-w-lg"
        >
          <template #header="{ toggle, isShown }">
            <div class="flex items-center justify-between">
              <UiTitle8 :isShown @click="toggle">
                {{ t('trns.title') }} {{ (!isShown && selectedTrnsIdsForTrnsList.length > 0) ? selectedTrnsIdsForTrnsList.length : '' }}
              </UiTitle8>
            </div>
          </template>

          <TrnsList
            :isHideDates="isDayToday"
            :isShowGroupSum="!isDayToday"
            :trnsIds="selectedTrnsIdsForTrnsList"
            class="py-1"
            isShowExpense
            isShowFilterByDesc
            isShowFilterByType
            isShowIncome
            isShowTransfers
          />
        </UiToggle>

        <TrnsNoTrns v-if="selectedTrnsIdsForTrnsList.length === 0" />
      </div>
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <StatDateSelectorModal
        v-if="isShowDateSelector"
        :maxRange
        @changeViewOptions="changeViewOptions"
        @onClose="isShowDateSelector = false"
      />

      <!-- Categories stat -->
      <BaseBottomSheet2
        v-if="quickModalCategoryId"
        isShow
        drugClassesCustom="bg-foreground-1 lg:w-[calc(100%-120px)] max-w-md"
        @closed="quickModalCategoryId = false"
      >
        <template #handler="{ close }">
          <div class="relative z-20">
            <BaseBottomSheetHandler />
            <BaseBottomSheetClose @onClick="close" />
          </div>
        </template>

        <template #default="">
          <div class="scrollerBlock grid h-[98dvh] content-start overflow-hidden overflow-y-auto">
            <CategoriesHeader
              :category="categoriesStore.items[quickModalCategoryId]"
              :parentCategory="categoriesStore.items?.[categoriesStore.items[quickModalCategoryId]?.parentId]"
              class="bg-foreground-5 sticky top-0 z-10"
            />

            <StatItem
              :quickModalCategoryId
              :storageKey="`${props.storageKey}sum-in-${quickModalCategoryId}`"
              :trnsIds="quickModalTrnsIds"
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
        drugClassesCustom="bg-foreground-1 lg:w-[calc(100%-120px)] max-w-md"
        @closed="isShowTrns = false"
      >
        <template #handler="{ close }">
          <div class="relative z-20">
            <BaseBottomSheetHandler />
            <BaseBottomSheetClose @onClick="close" />
          </div>
        </template>

        <div class="scrollerBlock grid h-[98dvh] content-start overflow-hidden overflow-y-auto">
          <TrnsList
            :trnsIds="selectedTrnsIdsForTrnsList"
            class="p-2"
            isShowFilterByDesc
            isShowFilterByType
            isShowGroupSum
            isShowHeader
            isShowIncome
            isShowExpense
          />
        </div>
      </BaseBottomSheet2>
    </Teleport>
  </div>
</template>
