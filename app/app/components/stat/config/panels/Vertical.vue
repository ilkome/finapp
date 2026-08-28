<script setup lang="ts">
import { statConfigKey } from '~/components/stat/injectionKeys'

const statConfig = inject(statConfigKey)!
</script>

<template>
  <StatConfigCategoryGroupingSelect
    :modelValue="statConfig.config.value.categories.bars.grouping"
    @update:modelValue="value => statConfig.updateConfig('categories', { bars: { grouping: value } })"
  />
</template>
