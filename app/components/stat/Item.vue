<script setup lang="ts">
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { FilterProvider } from '~/components/filter/types'
import type { MoneyTypeSlugNew, TotalCategory } from '~/components/stat/types'
import type { Range, StatDateProvider } from '~/components/date/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { TotalReturns } from '~/components/amount/getTotal'
import type { TrnId } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import { getTrnsIds } from '~/components/trns/getTrns'
import { markArea } from '~/components/stat/chart/utils'
import { seriesOptions } from '~/components/stat/chart/config2'
import { sortCategoriesByAmount } from '~/components/stat/utils'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { WalletId } from '~/components/wallets/types'

const props = defineProps<{
  hasChildren: boolean
  isQuickModal?: boolean
  preCategoriesIds?: CategoryId[]
  storageKey: string
  trnsIds: TrnId[]
  type: MoneyTypeSlugNew
  walletId?: WalletId
}>()

const { t } = useI18n()
const route = useRoute()
const filter = inject('filter') as FilterProvider
const statDate = inject('statDate') as StatDateProvider
const statConfig = inject('statConfig') as StatConfigProvider

const trnsStore = useTrnsStore()
const { getTotalOfTrnsIds } = useAmount()
const categoriesStore = useCategoriesStore()

const isShowDateSelector = ref(false)
const isShowTrns = ref(false)

const maxRange = computed(() => trnsStore.getRange(props.trnsIds))
const newBaseStorageKey = computed(() => `finapp-${statDate.params.value.intervalsBy}-${props.storageKey}-${JSON.stringify(filter?.categoriesIds?.value)}`)

const selectedType = ref<MoneyTypeSlugNew>('sum')
function onSelectType(type: MoneyTypeSlugNew) {
  if (type === 'sum') {
    isShowTrns.value = !isShowTrns.value
    return
  }

  selectedType.value = type === selectedType.value ? 'sum' : type
}

const typesInTrnsIds = computed(() => ({
  expense: props.trnsIds.some(id => trnsStore.items?.[id]?.type === 0),
  income: props.trnsIds.some(id => trnsStore.items?.[id]?.type === 1),
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

function getCats(trnsIds: TrnId[], isIntervalsByParent?: boolean, preCategoriesIds?: CategoryId[]) {
  const categoriesWithTrns = trnsIds?.reduce(
    (acc, trnId) => {
      let newCategoryId = trnsStore.items?.[trnId]?.categoryId
      if (!newCategoryId)
        return acc

      if (categoriesStore.transferCategoriesIds.includes(newCategoryId))
        return acc

      if (isIntervalsByParent) {
        const trnBaseCategory: CategoryItem | undefined = categoriesStore.items[newCategoryId]

        newCategoryId = trnBaseCategory?.parentId === 0
          ? trnsStore.items?.[trnId]?.categoryId
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

  if (statConfig.config.value?.isShowEmptyCategories && preCategoriesIds && preCategoriesIds.length > 0) {
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
  categoriesIds: filter?.categoriesIds?.value,
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
      categoriesIds: filter?.categoriesIds?.value,
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

  const isGrouped = statConfig.config.value.catsView === 'list' ? statConfig.config.value.catsList.isGrouped : statConfig.config.value.catsRound.isGrouped
  return getCats(selectedTrnsIdsForTrnsList.value ?? [], isGrouped, cats)
})

const biggestCatNumber = computed(() => {
  const income = cats.value.filter(c => c.value > 0).at(0)?.value ?? 0
  const expense = cats.value.filter(c => c.value < 0).at(0)?.value ?? 0

  return {
    expense,
    income,
  }
})

async function onClickCategory(categoryId: CategoryId) {
  await filter.setCategoryId(categoryId)
  await nextTick()

  const baseParams = {
    filterCategories: filter?.categoriesIds?.value.join(','),
    filterWallets: props.walletId ? props.walletId : filter?.walletsIds?.value.join(','),
    storageKey: props.storageKey ?? '',
  }

  const queryParams = new URLSearchParams(
    !statConfig.config.value.isCategoryPage
      ? { ...baseParams, ...Object.fromEntries(Object.entries(statDate.params.value)) }
      : baseParams,
  ).toString()

  if (route.name === 'categories-id') {
    useRouter().push(`/categories/${categoryId}?${queryParams}`)
  }
  else {
    useRouter().push(`/stat/categories/${categoryId}?${queryParams}`)
  }
}
</script>

<template>
  <div class="@container/stat">
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
              :catsLength="cats.length"
              isShowGrouping
            />
          </div>
        </template>

        <template v-if="cats.length > 0">
          <div
            v-if="statConfig.config.value.isShowCategoriesVertical && cats.length > 1"
            class="flex overflow-y-auto pb-2 pl-1 pt-4"
          >
            <StatCategoriesVertical
              v-for="item in cats"
              :key="item.id"
              :biggestCatNumber
              :item
              @click="onClickCategory"
            />
          </div>

          <!-- Lines -->
          <!-- <div
            v-if="statConfig.config.value.catsView === 'list'"
            :class="{
              'grid gap-2 px-0': statConfig.config.value.catsList.isGrouped && statConfig.config.value.catsList.isOpened,
              'md:max-w-lg': !statConfig.config.value.catsList.isGrouped || !statConfig.config.value.catsList.isOpened,
              'grid gap-1': statConfig.config.value.catsList.isItemsBg,
            }"
            class="pt-2"
          >
            <StatLinesItemLine
              v-for="item in cats"
              :key="item.id"
              :biggestCatNumber
              :class="{
                'bg-item-9 overflow-hidden rounded-lg': statConfig.config.value.catsList.isGrouped && statConfig.config.value.catsList.isOpened,
                'group': !statConfig.config.value.catsList.isItemsBg,
              }"
              :isHideDots="statConfig.config.value.catsList.isOpened"
              :item
              :isHideParent="props.hasChildren"
              :lineWidth="((statConfig.config.value.catsList.isGrouped && statConfig.config.value.catsList.isOpened) || statConfig.config.value.catsList.isLines) ? 0 : 1"
              @click="onClickCategory"
            >
              <div
                v-if="statConfig.config.value.catsList.isGrouped && statConfig.config.value.catsList.isOpened"
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
          </div> -->

          <div
            v-if="statConfig.config.value.catsView === 'list'"
            :class="{
              'grid gap-2 px-0': statConfig.config.value.catsList.isGrouped && statConfig.config.value.catsList.isOpened,
              'md:max-w-lg': !statConfig.config.value.catsList.isGrouped || !statConfig.config.value.catsList.isOpened,
              'grid gap-1': statConfig.config.value.catsList.isItemsBg,
            }"
            class="pt-2"
          >
            <UiToggle
              v-for="item in cats"
              :key="item.id"
              :class="{
                group: !statConfig.config.value.catsList.isItemsBg,
              }"
              :storageKey="`finapp-stat-cats-${item.id}`"
              :initStatus="false"
              :lineWidth="1"
              openPadding="!pb-2"
            >
              <template #header="{ toggle, isShown }">
                <div class="flex items-stretch justify-between">
                  <UiToggleAction
                    v-if="statConfig.config.value.catsList.isGrouped"
                    :isShown="isShown"
                    class="-mr-2.5"
                    @click="toggle"
                  />

                  <StatLinesItemLine
                    :biggestCatNumber
                    :isHideDots="statConfig.config.value.catsList.isOpened"
                    :isHideParent="props.hasChildren"
                    :item
                    :lineWidth="statConfig.config.value.catsList.isLines ? 0 : 1"
                    class="grow"
                    @click="onClickCategory"
                  />
                </div>
              </template>

              <div class="pl-12">
                <div v-if="!statConfig.config.value.catsList.isOpened">
                  <StatLinesItemLine
                    v-for="itemInside in getCats(item.trnsIds)"
                    :key="itemInside.id"
                    :biggestCatNumber
                    :class="{ 'bg-item-9 overflow-hidden rounded-lg': statConfig.config.value.catsList.isGrouped && statConfig.config.value.catsList.isOpened }"
                    :isHideDots="statConfig.config.value.catsList.isOpened"
                    :isHideParent="props.hasChildren"
                    :item="itemInside"
                    :lineWidth="((statConfig.config.value.catsList.isGrouped && statConfig.config.value.catsList.isOpened) || statConfig.config.value.catsList.isLines) ? 0 : 1"
                    class="group"
                    @click="onClickCategory"
                  />
                </div>

                <div
                  v-if="statConfig.config.value.catsList.isGrouped && statConfig.config.value.catsList.isOpened"
                  class="flex flex-wrap gap-1 pb-3 pl-2 pt-2"
                >
                  <StatLinesItemRound
                    v-for="itemInside in getCats(item.trnsIds)"
                    :key="itemInside.id"
                    :item="itemInside"
                    @click="onClickCategory"
                  />
                </div>
              </div>
            </UiToggle>
          </div>

          <!-- Rounds -->
          <div
            v-if="statConfig.config.value.catsView === 'round'"
            class="@3xl/stat:gap-2 flex flex-wrap gap-1 gap-y-2 pl-1 pt-2 md:max-w-lg"
          >
            <StatLinesItemRound
              v-for="item in cats"
              :key="item.id"
              :item
              :biggestCatNumber
              isShowAmount
              @click="onClickCategory"
            />
          </div>
        </template>
      </UiToggle>

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

    <!-- Modals -->
    <Teleport to="body">
      <StatDateSelectorModal
        v-if="isShowDateSelector"
        :maxRange
        @onClose="isShowDateSelector = false"
      />

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
