<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { StatReportContext } from '~/components/stat/report/types'
import type { TrnId } from '~/components/trns/types'

import { statHistoryAvailableKey, statInSheetKey, statVirtualFeedKey } from '~/components/stat/injectionKeys'
import { resolveCurrentPeriodEmptyKey } from '~/components/stat/statFeed'

const props = defineProps<{
  ctx?: StatReportContext
  isPeriodOneDay: boolean
  selectedTrnsIds: TrnId[]
  storageKey: string
}>()

const { t } = useI18n()
const isInSheet = inject(statInSheetKey, false)
const isVirtualFeedHost = inject(statVirtualFeedKey, false)
const isHistoryAvailable = inject(statHistoryAvailableKey, computed(() => true))

const shown = useStorage(`${props.storageKey}-trns`, true)
const isShowTitle = computed(() => props.ctx?.params.statConfig.config.value.trns.isShowTitle ?? true)
const isShowTypeTabs = computed(() => props.ctx?.params.statConfig.config.value.trns.isShowTypeTabs ?? true)
const isShowDescFilter = computed(() => props.ctx?.params.statConfig.config.value.trns.isShowDescFilter ?? false)
const isQuickCategoryFocused = computed(() => (props.ctx?.filteredCategoriesIds.value.length ?? 0) > 0)
const isOpen = computed({
  get: () => isQuickCategoryFocused.value || !isShowTitle.value || shown.value,
  set: (value) => {
    if (!isQuickCategoryFocused.value && isShowTitle.value)
      shown.value = value
  },
})
const isVirtualEnabled = computed(() =>
  isVirtualFeedHost
  && isHistoryAvailable.value
  && props.ctx
  && props.ctx.params.reportType.value === 'combined'
  && props.ctx.params.statDate.params.value.intervalSelected === -1,
)
const currentPeriodEmptyLabel = computed(() => props.ctx
  ? t(resolveCurrentPeriodEmptyKey(
      props.ctx.params.reportType.value,
      props.ctx.filteredType.value,
    ))
  : t('trns.noTrns'))
</script>

<template>
  <div class="mb-4 min-w-0 @3xl/main:max-w-md">
    <TrnsNoTrns
      v-if="isVirtualEnabled && selectedTrnsIds.length === 0"
      :label="currentPeriodEmptyLabel"
    />

    <UCollapsible
      v-if="selectedTrnsIds.length > 0 || isVirtualEnabled"
      v-model:open="isOpen"
      :unmountOnHide="false"
    >
      <UiTitleDropRight
        v-if="isShowTitle && !isQuickCategoryFocused && selectedTrnsIds.length > 0"
        :isShown="shown"
        :title="t('trns.title')"
      >
        <span class="text-xs leading-none tracking-wide text-dimmed">{{ selectedTrnsIds.length }}</span>
      </UiTitleDropRight>

      <template #content>
        <StatTrnsVirtualList
          v-if="isVirtualEnabled && ctx"
          :ctx="ctx"
          :class="isShowTitle && !isQuickCategoryFocused && 'pt-2'"
        />

        <StatSheetTrns
          v-else-if="isInSheet && ctx"
          :ctx
          :selectedTrnsIds
        />

        <TrnsList
          v-else
          :filterState="ctx?.trnsViewState"
          :isShowDates="!isPeriodOneDay"
          :isShowGroupSum="!isPeriodOneDay"
          :trnsIds="selectedTrnsIds"
          isShowExpense
          :isShowFilterByDesc="isShowDescFilter"
          isShowIncome
          isShowTransfers
          :isShowFilterByType="isShowTypeTabs"
          :class="isShowTitle && !isQuickCategoryFocused && 'pt-2'"
        />
      </template>
    </UCollapsible>

    <TrnsNoTrns v-else />
  </div>
</template>
