<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'

const statConfig = inject(statConfigKey)!
</script>

<template>
  <StatConfigCategoryGroupingSelect
    :modelValue="statConfig.config.value.categories.bars.grouping"
    parameterId="categories.bars.grouping"
    @update:modelValue="value => statConfig.updateConfig('categories', { bars: { grouping: value } })"
  />

  <StatConfigSwitch
    path="categories.bars.isShowTooltip"
    :title="$t('stat.config.categories.vertical.showTooltip')"
  />

  <StatConfigSwitch
    :disabled="!statConfig.config.value.categories.bars.isShowTooltip"
    path="categories.bars.isShowTooltipChildren"
    :title="$t('stat.config.categories.vertical.showTooltipChildren')"
  />
</template>
