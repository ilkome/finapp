<script setup lang="ts">
import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'

const statConfig = useStatConfigCtx()
</script>

<template>
  <StatConfigCategoryGroupingSelect
    :modelValue="statConfig.categories.value.bars.grouping"
    parameterId="categories.bars.grouping"
    @update:modelValue="value => statConfig.updateConfig('categories', { bars: { grouping: value } })"
  />

  <StatConfigSwitch
    path="categories.bars.isShowTooltip"
    :title="$t('stat.config.categories.vertical.showTooltip')"
  />

  <StatConfigSwitch
    :disabled="!statConfig.categories.value.bars.isShowTooltip"
    path="categories.bars.isShowTooltipChildren"
    :title="$t('stat.config.categories.vertical.showTooltipChildren')"
  />
</template>
