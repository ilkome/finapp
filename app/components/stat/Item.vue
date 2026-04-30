<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { filterKey, statConfigKey, statDateKey } from '~/components/stat/injectionKeys'
import { useStatItem } from '~/components/stat/useStatItem'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  categoryId?: CategoryId
  hasChildren?: boolean
  preCategoriesIds?: CategoryId[]
  statTab: StatTabSlug
  storageKey: string
  trnsIds: TrnId[]
  type?: SeriesSlugSelected
  walletId?: WalletId
}>()

const { t } = useI18n()
const filter = inject(filterKey)!
const statDate = inject(statDateKey)!
const statConfig = inject(statConfigKey)!
const trnsStore = useTrnsStore()

const isOneCategory = computed(() => !!props.categoryId)
const shouldShowAmounts = computed(() => !props.categoryId || props.categoryId !== 'transfer')
const isRoundShow = computed(() => statConfig.config.value.catsRound.isShow)
const isListShow = computed(() => statConfig.config.value.catsList.isShow)
const isVerticalShow = computed(() => statConfig.config.value.vertical.isShow)
const isShowAverage = computed(() => statConfig.config.value.statAverage.isShow)
const isTrnsShow = computed(() => statConfig.config.value.trns.isShow)

const {
  averageTotal,
  chartSeries,
  chartXAxisLabels,
  filteredCategoriesIds,
  filteredType,
  isPeriodOneDay,
  onClickSumItem,
  onSetCategoryFilter,
  rangeTotal,
  selectedAndFilteredTrnsIds,
  selectedTrnsIds,
  selectedTypeForSum,
  statItemStorageKey,
} = useStatItem({
  filter,
  statConfig,
  statDate,
  statTab: computed(() => props.statTab),
  storageKey: computed(() => props.storageKey),
  trnsIds: computed(() => props.trnsIds),
  type: computed(() => props.type),
})

const hasCategoriesData = computed(() => props.hasChildren || (props.preCategoriesIds ?? []).length > 0)
const shouldUseTwoColumnLayout = computed(() => props.statTab !== 'split' && isListShow.value)

// Modal state: 'quickView' shows snapshot trnsIds, 'fullTrns' shows reactive selectedAndFilteredTrnsIds
const modalSource = ref<'fullTrns' | 'quickView' | null>(null)
const quickViewTrnsIds = ref<TrnId[]>([])
const modalTrnsIds = computed(() => {
  if (modalSource.value === 'quickView')
    return quickViewTrnsIds.value
  if (modalSource.value === 'fullTrns')
    return selectedAndFilteredTrnsIds.value
  return []
})

function closeModal() {
  modalSource.value = null
  quickViewTrnsIds.value = []
}

function onClickCategory(clickedCategoryId: CategoryId) {
  if (props.categoryId) {
    filter.setCategoryId(clickedCategoryId)

    const baseParams = {
      filterCategories: filter.categoriesIds.value.join(','),
      filterWallets: props.walletId ? props.walletId : filter.walletsIds.value.join(','),
      storageKey: props.storageKey ?? '',
    }

    const queryParams = new URLSearchParams({ ...baseParams }).toString()
    return useRouter().push(`/categories/${clickedCategoryId}?${queryParams}`)
  }

  quickViewTrnsIds.value = trnsStore.getStoreTrnsIds({
    categoriesIds: [clickedCategoryId],
    sort: true,
    trnsIds: selectedAndFilteredTrnsIds.value,
  })
  modalSource.value = 'quickView'
}

function onClickSumItemWrap(type: SeriesSlugSelected) {
  if (type === 'netIncome')
    modalSource.value = 'fullTrns'

  onClickSumItem(type)
}
</script>

<template>
  <div class="@container/stat">
    <StatChartWrap
      v-if="shouldShowAmounts"
      :series="chartSeries"
      :xAxisLabels="chartXAxisLabels"
      class="pb-3"
    />

    <div class="grid min-w-0 content-start gap-3">
      <StatDateNavigation>
        <StatFilterSelected
          v-if="filter.isShow.value"
          isShowCategories
          isShowWallets
        />

        <StatCategoriesConfigMenu
          :filteredCategoriesIds
          :preCategoriesIds="props.preCategoriesIds"
          :selectedTrnsIds
          class="ml-auto"
        />
      </StatDateNavigation>

      <StatSumWrap
        v-if="shouldShowAmounts"
        :averageTotal
        :categoryId="props.categoryId"
        :filteredType="filteredType"
        :total="rangeTotal"
        :trnsIds
        :type="selectedTypeForSum"
        :walletId
        @click="onClickSumItemWrap"
        @clickAverage="statConfig.updateConfig('statAverage', { isShow: !isShowAverage })"
      />

      <StatCategoriesRoundSection
        v-if="isRoundShow && hasCategoriesData && (selectedTrnsIds.length > 0 || filteredCategoriesIds.length > 0)"
        :filteredCategoriesIds
        :isOneCategory="isOneCategory"
        :preCategoriesIds="props.preCategoriesIds"
        :selectedTrnsIds
        @clickCategory="onClickCategory"
        @setCategoryFilter="onSetCategoryFilter"
      />

      <div
        v-if="selectedTrnsIds.length > 0"
        class="_min-h-dvh grid min-w-0 content-start items-start gap-4"
      >
        <div
          :class="{
            'grid gap-5 @3xl/stat:grid-cols-2 @3xl/stat:gap-6': shouldUseTwoColumnLayout,
          }"
        >
          <StatCategoriesDetailedSection
            v-if="(isListShow || isVerticalShow) && hasCategoriesData"
            :isOneCategory="isOneCategory"
            :preCategoriesIds="props.preCategoriesIds"
            :selectedTrnsIds="selectedAndFilteredTrnsIds"
            :storageKey="statItemStorageKey"
            :type="props.type ?? 'netIncome'"
            @clickCategory="onClickCategory"
            @setCategoryFilter="onSetCategoryFilter"
          />

          <StatTrns
            v-if="isTrnsShow"
            :isPeriodOneDay="isPeriodOneDay"
            :selectedTrnsIds="selectedAndFilteredTrnsIds"
            :storageKey="statItemStorageKey"
            class="@3xl/stat:order-1"
          />
        </div>
      </div>

      <div v-else class="mx-auto grid w-full max-w-150 content-start justify-items-center gap-4">
        <TrnsNoTrns />

        <StatCategoriesRoundRecent />
      </div>
    </div>

    <BottomSheetModal
      v-if="modalSource"
      @closed="closeModal"
    >
      <UiTitleModal>
        {{ t('trns.title') }} {{ modalTrnsIds.length > 0 ? modalTrnsIds.length : '' }}
      </UiTitleModal>

      <div class="scrollerBlock bottomSheetContentInside">
        <TrnsList
          :isShowDates="!isPeriodOneDay"
          :isShowGroupSum="!isPeriodOneDay"
          :size="50"
          :trnsIds="modalTrnsIds"
          isShowExpense
          isShowFilterByDesc
          isShowFilterByType
          isShowIncome
          isShowTransfers
          @click="modalSource === 'quickView' ? closeModal() : undefined"
        />
      </div>
    </BottomSheetModal>
  </div>
</template>
