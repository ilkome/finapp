<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { FilterProvider } from '~/components/filter/types'
import type { CategoriesWithTrns, CategoryWithData, MoneyTypeSlugNew } from '~/components/stat/types'
import type { Range, StatDateProvider } from '~/components/date/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { TotalReturns } from '~/components/amount/getTotal'
import type { TrnId } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import { getTrnsIds } from '~/components/trns/getTrns'
import { markArea } from '~/components/stat/chart/utils'
import { seriesOptions } from '~/components/stat/chart/config'
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

const statTypeShow = computed(() => ({
  expense: props.trnsIds.some(id => trnsStore.items?.[id]?.type === 0),
  income: props.trnsIds.some(id => trnsStore.items?.[id]?.type === 1),
}))

const isPeriodOneDay = computed(() => (statDate.params.value.rangeBy === 'day' && statDate.params.value.rangeDuration === 1) || (statDate.params.value.intervalsBy === 'day' && statDate.params.value.intervalSelected !== -1))

const rangeTrnsIds = computed(() => {
  const params = {
    dates: {
      from: statDate.range.value.start,
      until: statDate.range.value.end,
    },
    trnsIds: props.trnsIds,
  }

  return trnsStore.getStoreTrnsIds(params, { includesChildCategories: false })
})

const intervalsData = computed(() => getIntervalsData(rangeTrnsIds.value, statDate.intervalsInRange.value))

const selectedTrnsIds = computed(() => {
  const typeMapping = {
    expense: [0, 2],
    income: [1, 2],
    sum: [0, 1, 2],
  }

  const trnsTypes = typeMapping[selectedType.value]

  if (!trnsTypes) {
    return rangeTrnsIds.value
  }

  return trnsStore.getStoreTrnsIds({
    trnsIds: statDate.params.value.intervalSelected !== -1
      ? intervalsData.value[statDate.params.value.intervalSelected]?.trnsIds
      : rangeTrnsIds.value,
    trnsTypes,
  }, { includesChildCategories: false })
})

const rangeTotal = computed(() => {
  const trnsIds = statDate.params.value.intervalSelected !== -1
    ? intervalsData.value[statDate.params.value.intervalSelected]?.trnsIds
    : rangeTrnsIds.value

  return getTotalOfTrnsIds(trnsIds)
})

const isCategoriesGrouped = computed(() => statConfig.config.value[statConfig.config.value.catsView === 'list' ? 'catsList' : 'catsRound'].isGrouped)

const categoriesWithData = computed(() => {
  const cats: CategoryId[] = []
  if (statConfig.config.value?.isShowEmptyCategories && props.preCategoriesIds) {
    cats.push(...props.preCategoriesIds)
  }

  return getCategoriesWithData(selectedTrnsIds.value ?? [], isCategoriesGrouped.value, cats)
})

const xAxisLabels = computed(() => intervalsData.value.map(i => +i.range.start) ?? [])

const series = computed(() => {
  const types = props.type === 'sum' ? ['expense', 'income'] as const : [props.type]
  const intervalsTotal = intervalsData.value.map(g => g.total)
  const baseSeries = types.map(type => createSeriesItem(type, intervalsTotal))

  return statDate.params.value.intervalSelected >= 0
    ? addMarkArea(baseSeries)
    : baseSeries
})

const biggestCatNumber = computed(() => {
  const income = categoriesWithData.value.filter(c => c.value > 0).at(0)?.value ?? 0
  const expense = categoriesWithData.value.filter(c => c.value < 0).at(0)?.value ?? 0

  return {
    expense,
    income,
  }
})

function onClickCategory(categoryId: CategoryId) {
  filter.setCategoryId(categoryId)

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

function onClickSumItem(type: MoneyTypeSlugNew) {
  if (type === 'sum') {
    isShowTrns.value = !isShowTrns.value
    return
  }

  selectedType.value = type === selectedType.value ? 'sum' : type
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
  }, [] as {
    range: Range
    total: TotalReturns
    trnsIds: TrnId[]
  }[])
}

function getParentCategoryId(categoryId: CategoryId): CategoryId | undefined {
  const category = categoriesStore.items[categoryId]
  return category?.parentId === 0 ? undefined : category?.parentId
}

function createSeriesItem(typeItem: 'expense' | 'income' | 'sum', data: TotalReturns[]) {
  return {
    color: seriesOptions[typeItem].color,
    cursor: 'default',
    data: data.map(i => typeItem !== 'sum' ? Math.abs(i[typeItem]) : i[typeItem]),
    name: t(`money.${typeItem}`),
    type: seriesOptions[typeItem].type,
  }
}

function addMarkArea(series: any[]) {
  const selectedStartDate = intervalsData.value?.[statDate.params.value.intervalSelected]?.range.start

  if (!selectedStartDate)
    return series

  if (statConfig.config.value?.chartType === 'bar') {
    series[0].markArea = markArea(selectedStartDate)
    return series
  }

  const markAreaIdx = series.findIndex(s => s.markedArea === 'markedArea')
  const markAreaSeries = {
    data: [],
    markArea: markArea(selectedStartDate),
    markedArea: 'markedArea',
    type: 'bar',
  }

  return markAreaIdx === -1
    ? [...series, markAreaSeries]
    : series.map((s, i) => i === markAreaIdx ? markAreaSeries : s)
}

function getCategoriesWithData(trnsIds: TrnId[], isGrouped?: boolean, preCategoriesIds?: CategoryId[]) {
  if (!trnsIds?.length)
    return []

  const categoriesWithTrns = trnsIds.reduce((acc, trnId) => {
    // Get category ID from transaction
    const categoryId = trnsStore.items?.[trnId]?.categoryId
    if (!categoryId)
      return acc

    // Skip transfer categories
    if (categoriesStore.transferCategoriesIds.includes(categoryId))
      return acc

    const finalCategoryId = isGrouped
      ? getParentCategoryId(categoryId)
      : categoryId

    if (!finalCategoryId)
      return acc

    // Add transaction to category group
    acc[finalCategoryId] ??= []
    acc[finalCategoryId].push(trnId)
    return acc
  }, {} as CategoriesWithTrns)

  const categoriesWithData = Object.keys(categoriesWithTrns)
    .reduce(
      (acc, categoryId) => {
        const totalInCategory = getTotalOfTrnsIds(categoriesWithTrns[categoryId]!)
        const trnsIdsInCategory = categoriesWithTrns[categoryId]!

        const content = {
          id: categoryId,
          trnsIds: trnsIdsInCategory,
          value: totalInCategory.sum,
        }

        acc.push(content)
        return acc
      },
      [] as CategoryWithData[],
    )

  // Add empty categories
  if (preCategoriesIds && preCategoriesIds.length > 0) {
    for (const id of preCategoriesIds) {
      if (!categoriesWithTrns[id]) {
        categoriesWithData.push({
          id,
          trnsIds: [],
          value: 0,
        })
      }
    }
  }

  return categoriesWithData.sort((a, b) => sortCategoriesByAmount(a, b))
}

function getCategoriesWithData2(trnsIds: TrnId[], isGrouped?: boolean, preCategoriesIds?: CategoryId[]) {
  if (!trnsIds?.length)
    return []

  return trnsIds.reduce((acc, trnId) => {
    const categoryId = trnsStore.items?.[trnId]?.categoryId
    if (!categoryId || categoriesStore.transferCategoriesIds.includes(categoryId))
      return acc

    const currentCategory = categoriesStore.items[categoryId]
    if (!currentCategory)
      return acc

    const parentCategoryId = getParentCategoryId(categoryId)
    const parentCategory = parentCategoryId ? categoriesStore.items[parentCategoryId] : null

    // Handle categories with parent
    if (parentCategory && parentCategoryId) {
      const existingParent = acc.find(c => c.id === parentCategoryId)

      if (existingParent) {
        // Update existing parent
        existingParent.trnsIds.push(trnId)

        const existingCategory = existingParent.categories?.find(c => c.id === categoryId)
        if (existingCategory) {
          existingCategory.trnsIds.push(trnId)
        }
        else {
          existingParent.categories ??= []
          existingParent.categories.push({
            id: categoryId,
            name: currentCategory.name,
            trnsIds: [trnId],
            value: 0,
          })
        }
      }
      else {
        // Create new parent category entry
        acc.push({
          categories: [{
            id: categoryId,
            name: currentCategory.name,
            trnsIds: [trnId],
            value: 0,
          }],
          id: parentCategoryId,
          name: parentCategory.name,
          trnsIds: [trnId],
          value: 0,
        })
      }
    }
    // Handle categories without parent
    else {
      const existingCategory = acc.find(c => c.id === categoryId)

      if (existingCategory) {
        existingCategory.trnsIds.push(trnId)
      }
      else {
        acc.push({
          id: categoryId,
          name: currentCategory.name,
          trnsIds: [trnId],
          value: 0,
        })
      }
    }

    return acc
  }, [] as CategoryWithData[])
}
</script>

<template>
  <div class="@container/stat">
    <div class="grid gap-4">
      <pre
        v-for="item in getCategoriesWithData2(selectedTrnsIds)"
        :key="item.id"
        class="text-2xs"
      >
        {{ item }}
      </pre>
    </div>

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
      :total="rangeTotal"
      :isShowExpense="statTypeShow.expense"
      :isShowIncome="statTypeShow.income"
      :selectedType
      :type="props.type"
      @click="onClickSumItem"
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
              {{ t('categories.title') }} {{ (!isShown && categoriesWithData.length > 0) ? categoriesWithData.length : '' }}
            </UiTitle8>

            <StatCategoriesButtons
              v-if="isShown"
              :catsLength="categoriesWithData.length"
              isShowGrouping
            />
          </div>
        </template>

        <template v-if="categoriesWithData.length > 0">
          <div
            v-if="statConfig.config.value.isShowCategoriesVertical && categoriesWithData.length > 1"
            class="flex overflow-y-auto pb-2 pl-1 pt-4"
          >
            <StatCategoriesVertical
              v-for="item in categoriesWithData"
              :key="item.id"
              :biggestCatNumber
              :item
              @click="onClickCategory"
            />
          </div>

          <!-- Lines -->
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
              v-for="item in categoriesWithData"
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
                    v-if="statConfig.config.value.catsList.isGrouped && categoriesStore.hasChildren(item.id)"
                    :isShown="isShown"
                    class="-mr-2.5"
                    @click="toggle"
                  />
                  <div
                    v-else-if="statConfig.config.value.catsList.isGrouped"
                    class="w-8"
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

              <!-- Inside -->
              <div class="border-item-5 ml-5 border-l pl-3">
                <div v-if="!statConfig.config.value.catsList.isOpened">
                  <StatLinesItemLine
                    v-for="itemInside in getCategoriesWithData(item.trnsIds)"
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
                    v-for="itemInside in getCategoriesWithData(item.trnsIds)"
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
              v-for="item in categoriesWithData"
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
        v-if="selectedTrnsIds.length > 0"
        :storageKey="`${newBaseStorageKey}-${props.type}trns-all`"
        :initStatus="true"
        class="min-w-80 md:max-w-lg"
      >
        <template #header="{ toggle, isShown }">
          <div class="flex items-center justify-between">
            <UiTitle8 :isShown @click="toggle">
              {{ t('trns.title') }} {{ (!isShown && selectedTrnsIds.length > 0) ? selectedTrnsIds.length : '' }}
            </UiTitle8>
          </div>
        </template>

        <TrnsList
          :isHideDates="isPeriodOneDay"
          :isShowGroupSum="!isPeriodOneDay"
          :trnsIds="selectedTrnsIds"
          class="py-1"
          isShowExpense
          isShowFilterByDesc
          isShowFilterByType
          isShowIncome
          isShowTransfers
        />
      </UiToggle>

      <TrnsNoTrns v-if="selectedTrnsIds.length === 0" />
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
        v-if="selectedTrnsIds && selectedTrnsIds?.length > 0 && isShowTrns"
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
            :trnsIds="selectedTrnsIds"
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
