<script setup lang="ts">
import type { StatReportContext } from '~/components/stat/useStatReportContext'
import type { TrnId } from '~/components/trns/types'

import { statDashboardKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  ctx?: StatReportContext
  isPeriodOneDay: boolean
  selectedTrnsIds: TrnId[]
  storageKey: string
}>()

const { t } = useI18n()
const isDashboard = inject(statDashboardKey, false)

const shown = useStoredToggle(`${props.storageKey}-trns`, true)
const isVirtualEnabled = computed(() =>
  isDashboard
  && props.ctx
  && props.ctx.params.statTab.value !== 'split'
  && props.ctx.params.statDate.params.value.intervalSelected === -1,
)
</script>

<template>
  <div class="mb-4 min-w-0 @3xl/main:max-w-md">
    <UCollapsible
      v-if="selectedTrnsIds.length > 0 || isVirtualEnabled"
      v-model:open="shown"
      :unmountOnHide="false"
    >
      <UiTitleCollapse :isShown="shown">
        {{ t('trns.title') }} {{ (!shown && selectedTrnsIds.length > 0) ? selectedTrnsIds.length : '' }}
      </UiTitleCollapse>

      <template #content>
        <StatTrnsVirtualList
          v-if="isVirtualEnabled && ctx"
          :ctx="ctx"
          class="pt-2"
        />

        <TrnsList
          v-else
          :isShowDates="!isPeriodOneDay"
          :isShowGroupSum="!isPeriodOneDay"
          :trnsIds="selectedTrnsIds"
          isShowExpense
          isShowFilterByDesc
          isShowIncome
          isShowTransfers
          isShowFilterByType
          class="pt-2"
        />
      </template>
    </UCollapsible>

    <TrnsNoTrns v-else />
  </div>
</template>
