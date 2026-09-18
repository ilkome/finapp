<script setup lang="ts">
import type { StatConfigBooleanPath } from '~/components/stat/config/switches'
import type { StatBlockPanelId } from '~/components/stat/views/types'

import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'
import { statConfigParameterIdsKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  panel: StatBlockPanelId
  parameterIds?: string[]
}>()

const { t } = useI18n()
const statConfig = useStatConfigCtx()

provide(statConfigParameterIdsKey, computed(() => props.parameterIds ? new Set(props.parameterIds) : null))

// Panels that are nothing but a list of switches.
const switchPanels: Partial<Record<StatBlockPanelId, { path: StatConfigBooleanPath, title: string }[]>> = {
  navigation: [
    { path: 'date.isPinned', title: t('stat.config.navigation.pin') },
    { path: 'date.isShowNavigation', title: t('stat.config.navigation.showButtons') },
  ],
  summary: [
    { path: 'summary.isPinned', title: t('stat.config.summary.pin') },
    { path: 'summary.isShowChart', title: t('stat.config.summary.showChart') },
  ],
}
</script>

<template>
  <div v-if="switchPanels[panel]" class="grid gap-0.5">
    <StatConfigSwitch
      v-for="item in switchPanels[panel]"
      :key="item.path"
      :path="item.path"
      :title="item.title"
    />
  </div>

  <div v-else-if="panel === 'statAverage'" class="grid gap-3">
    <StatConfigFieldRow parameterId="average.count" :title="t('stat.config.statAverage.count.label')">
      <UiNumberStepper
        :modelValue="statConfig.average.value.count"
        :min="1"
        @update:modelValue="value => statConfig.updateConfig('average', { count: value })"
      />
    </StatConfigFieldRow>
  </div>

  <template v-else-if="panel === 'vertical'">
    <StatConfigCategoryGroupingSelect
      :modelValue="statConfig.categories.value.bars.grouping"
      parameterId="categories.bars.grouping"
      @update:modelValue="value => statConfig.updateConfig('categories', { bars: { grouping: value } })"
    />

    <StatConfigSwitch
      path="categories.bars.isShowTooltip"
      :title="t('stat.config.categories.vertical.showTooltip')"
    />

    <StatConfigSwitch
      :disabled="!statConfig.categories.value.bars.isShowTooltip"
      path="categories.bars.isShowTooltipChildren"
      :title="t('stat.config.categories.vertical.showTooltipChildren')"
    />
  </template>

  <StatConfigPanelsWallets v-else-if="panel === 'wallets'" />
  <StatConfigPanelsChart v-else-if="panel === 'chart'" />
  <StatConfigPanelsTrns v-else-if="panel === 'trns'" />
  <StatConfigPanelsCatsRound v-else-if="panel === 'catsRound'" />
  <StatConfigPanelsCatsList v-else-if="panel === 'catsList'" />
</template>
