<script setup lang="ts">
import type { StatReportContext } from '~/components/stat/useStatReportContext'

defineProps<{
  ctx: StatReportContext
}>()

const { t } = useI18n()
</script>

<template>
  <StatCategoriesRoundSection
    v-if="ctx.params.statConfig.config.value.categories.round.isShow && ctx.hasCategoriesData.value && (ctx.selectedTrnsIds.value.length > 0 || ctx.filteredCategoriesIds.value.length > 0)"
    :excludedCategoriesIds="ctx.statExcludedIds.value"
    :filteredCategoriesIds="ctx.filteredCategoriesIds.value"
    :isOneCategory="ctx.isOneCategory.value"
    :preCategoriesIds="ctx.params.preCategoriesIds?.value"
    :selectedTrnsIds="ctx.selectedTrnsIds.value"
    @clickCategory="ctx.onClickCategory"
    @setCategoryFilter="ctx.onSetCategoryFilter"
  />

  <div
    v-if="ctx.selectedTrnsIds.value.length > 0"
    class="_min-h-dvh grid min-w-0 content-start items-start gap-4"
  >
    <div
      :class="{
        'grid gap-5 @3xl/stat:grid-cols-2 @3xl/stat:gap-6': ctx.shouldUseTwoColumnLayout.value,
      }"
    >
      <StatCategoriesBreakdown
        v-if="(ctx.params.statConfig.config.value.categories.list.isShow || ctx.params.statConfig.config.value.categories.bars.isShow) && ctx.hasCategoriesData.value"
        :excludedCategoriesIds="ctx.statExcludedIds.value"
        :isOneCategory="ctx.isOneCategory.value"
        :preCategoriesIds="ctx.params.preCategoriesIds?.value"
        :selectedTrnsIds="ctx.selectedAndFilteredTrnsIds.value"
        :storageKey="ctx.statItemStorageKey.value"
        :type="ctx.params.type.value ?? 'netIncome'"
        @clickCategory="ctx.onClickCategory"
        @setCategoryFilter="ctx.onSetCategoryFilter"
      />

      <StatTrns
        v-if="ctx.params.statConfig.config.value.trns.isShow"
        :isPeriodOneDay="ctx.isPeriodOneDay.value"
        :selectedTrnsIds="ctx.selectedAndFilteredTrnsIds.value"
        :storageKey="ctx.statItemStorageKey.value"
        class="@3xl/stat:order-1"
      />
    </div>
  </div>

  <div v-else class="mx-auto grid w-full max-w-150 content-start justify-items-center gap-4">
    <TrnsNoTrns />

    <CategoriesQuickAdd />
  </div>

  <BottomSheetModal
    v-if="ctx.modalSource.value"
    @closed="ctx.closeModal"
  >
    <UiTitleModal>
      {{ t('trns.title') }} {{ ctx.modalTrnsIds.value.length > 0 ? ctx.modalTrnsIds.value.length : '' }}
    </UiTitleModal>

    <div class="bottomSheetContentInside scrollerBlock">
      <TrnsList
        :isShowDates="!ctx.isPeriodOneDay.value"
        :isShowGroupSum="!ctx.isPeriodOneDay.value"
        :size="50"
        :trnsIds="ctx.modalTrnsIds.value"
        isShowExpense
        isShowFilterByDesc
        isShowFilterByType
        isShowIncome
        isShowTransfers
      />
    </div>
  </BottomSheetModal>
</template>
