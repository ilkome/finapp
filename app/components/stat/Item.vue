<script setup lang="ts">
import type { CategoryId } from '~/components/categories/types'
import type { SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { filterKey, statConfigKey, statDateKey } from '~/components/stat/injectionKeys'
import { useStatItem } from '~/components/stat/useStatItem'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  hasChildren?: boolean
  isOneCategory?: boolean
  preCategoriesIds?: CategoryId[]
  statTab: StatTabSlug
  storageKey: string
  trnsIds: TrnId[]
  type?: SeriesSlugSelected
  walletId?: WalletId
}>()

const route = useRoute()
const { t } = useI18n()
const filter = inject(filterKey)!
const statDate = inject(statDateKey)!
const statConfig = inject(statConfigKey)!
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

const categoryId = computed(() => props.isOneCategory ? route.params.id as CategoryId : undefined)
const isNotTransferCategory = computed(() => !props.isOneCategory || categoryId.value !== 'transfer')

const {
  averageTotal,
  chartSeries,
  chartXAxisLabels,
  filteredCategoriesIds,
  filteredType,
  isPeriodOneDay,
  newBaseStorageKey,
  onClickSumItem,
  onSetCategoryFilter,
  rangeTotal,
  selectedAndFilteredTrnsIds,
  selectedTrnsIds,
  selectedTypeForSum,
} = useStatItem({
  filter,
  statConfig,
  statDate,
  statTab: computed(() => props.statTab),
  storageKey: computed(() => props.storageKey),
  trnsIds: computed(() => props.trnsIds),
  type: computed(() => props.type),
})

const quickViewTrns = ref<TrnId[]>([])
const isShowTrns = ref(false)
const hasCategoriesData = computed(() => props.hasChildren || (props.preCategoriesIds ?? []).length > 0)

function onClickCategory(clickedCategoryId: CategoryId) {
  if (route.name === 'categories-id') {
    filter.setCategoryId(clickedCategoryId)

    const baseParams = {
      filterCategories: filter.categoriesIds.value.join(','),
      filterWallets: props.walletId ? props.walletId : filter.walletsIds.value.join(','),
      storageKey: props.storageKey ?? '',
    }

    const queryParams = new URLSearchParams({ ...baseParams }).toString()
    return useRouter().push(`/categories/${clickedCategoryId}?${queryParams}`)
  }

  // Show quick view
  quickViewTrns.value = trnsStore.getStoreTrnsIds({
    categoriesIds: [clickedCategoryId],
    sort: true,
    trnsIds: selectedAndFilteredTrnsIds.value,
  })
}

function onClickSumItemWrap(type: SeriesSlugSelected) {
  if (type === 'netIncome')
    isShowTrns.value = true

  onClickSumItem(type)
}
</script>

<template>
  <div class="@container/stat">
    <StatChartWrap
      v-if="isNotTransferCategory"
      :chartView="statConfig.config.value.chartView"
      :series="chartSeries"
      :xAxisLabels="chartXAxisLabels"
      class="pb-3"
    >
      <StatDateQuick v-if="statConfig.config.value.date.isShowQuick" />
    </StatChartWrap>

    <div class="grid min-w-0 content-start gap-3">
      <StatDateNavigation>
        <StatFilterSelected
          v-if="filter.isShow.value"
          isShowCategories
          isShowWallets
        />
      </StatDateNavigation>

      <StatSumWrap
        v-if="isNotTransferCategory"
        :averageConfig="statConfig.config.value.statAverage.count"
        :averageTotal
        :categoryId
        :filter
        :filteredType="filteredType"
        :isShowAverage="statConfig.config.value.statAverage.isShow"
        :isShowExpense="true"
        :isShowIncome="true"
        :statDate
        :total="rangeTotal"
        :trnsIds
        :type="selectedTypeForSum"
        :walletId
        @click="onClickSumItemWrap"
        @clickAverage="statConfig.updateConfig('statAverage', { isShow: !statConfig.config.value.statAverage.isShow })"
      />

      <div class="_min-h-dvh grid min-w-0 content-start items-start gap-4">
        <StatCategoriesSection
          v-if="statConfig.config.value.catsRound.isShow && hasCategoriesData"
          :filteredCategoriesIds
          :isOneCategory="props.isOneCategory"
          :preCategoriesIds="props.preCategoriesIds || categoriesStore.favoriteCategoriesIds"
          :selectedTrnsIds
          @clickCategory="onClickCategory"
          @setCategoryFilter="onSetCategoryFilter"
        />

        <div
          :class="{
            'grid gap-5 @3xl/page:grid-cols-2 @3xl/page:gap-6': props.statTab !== 'split' && statConfig.config.value.catsList.isShow,
          }"
        >
          <StatCategoriesSection2
            v-if="(statConfig.config.value.catsList.isShow || statConfig.config.value.vertical.isShow) && hasCategoriesData"
            :isOneCategory="props.isOneCategory"
            :preCategoriesIds="props.preCategoriesIds"
            :selectedTrnsIds="selectedAndFilteredTrnsIds"
            :storageKey="newBaseStorageKey"
            :type="props.type ?? 'netIncome'"
            @clickCategory="onClickCategory"
            @setCategoryFilter="onSetCategoryFilter"
          />

          <StatTrns
            :isPeriodOneDay="isPeriodOneDay"
            :selectedTrnsIds="selectedAndFilteredTrnsIds"
            class="@3xl/page:order-1"
          />
        </div>
      </div>
    </div>

    <!-- Quick View Trns -->
    <Teleport
      v-if="quickViewTrns?.length > 0"
      to="body"
    >
      <BottomSheet
        v-if="quickViewTrns?.length > 0"
        isShow
        drugClassesCustom="bottomSheetDrugClassesCustom"
        @closed="quickViewTrns = []"
      >
        <template #handler="{ close }">
          <BottomSheetHandler />
          <BottomSheetClose @click="close" />
        </template>

        <div class="bottomSheetContent">
          <UiTitleModal>
            {{ t('trns.title') }} {{ quickViewTrns.length > 0 ? quickViewTrns.length : '' }}
          </UiTitleModal>

          <div class="scrollerBlock bottomSheetContentInside pb-2">
            <TrnsList
              :isShowDates="!isPeriodOneDay"
              :isShowGroupSum="!isPeriodOneDay"
              :size="50"
              :trnsIds="quickViewTrns"
              isShowExpense
              isShowFilterByDesc
              isShowFilterByType
              isShowIncome
              isShowTransfers
              @click="() => quickViewTrns = []"
            />
          </div>
        </div>
      </BottomSheet>
    </Teleport>

    <Teleport to="body">
      <BottomSheet
        v-if="isShowTrns"
        isShow
        drugClassesCustom="bottomSheetDrugClassesCustom"
        @closed="isShowTrns = false"
      >
        <template #handler="{ close }">
          <BottomSheetHandler />
          <BottomSheetClose @click="close" />
        </template>

        <div class="bottomSheetContent">
          <UiTitleModal>
            {{ t('trns.title') }} {{ selectedAndFilteredTrnsIds.length > 0 ? selectedAndFilteredTrnsIds.length : '' }}
          </UiTitleModal>

          <div class="scrollerBlock bottomSheetContentInside">
            <TrnsList
              :isShowDates="!isPeriodOneDay"
              :isShowGroupSum="!isPeriodOneDay"
              :size="50"
              :trnsIds="selectedAndFilteredTrnsIds"
              isShowExpense
              isShowFilterByDesc
              isShowFilterByType
              isShowIncome
              isShowTransfers
            />
          </div>
        </div>
      </BottomSheet>
    </Teleport>
  </div>
</template>
