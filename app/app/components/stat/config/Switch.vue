<script setup lang="ts">
import type { MiniItemConfig } from '~/components/stat/config/schema'

import { buildConfigPatch, getConfigValue } from '~/components/stat/config/schema'
import { statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  // Dot path to a boolean field in MiniItemConfig, e.g. 'categories.round.isGrouped'.
  path: string
  title: string
}>()

const statConfig = inject(statConfigKey)!

const isChecked = computed((): boolean => getConfigValue(statConfig.config.value, props.path) as boolean)

function toggle() {
  const [key, ...rest] = props.path.split('.') as [keyof MiniItemConfig, ...string[]]
  statConfig.updateConfig(key, buildConfigPatch(rest, !isChecked.value) as never)
}
</script>

<template>
  <UiSwitchItem
    :checkboxValue="isChecked"
    :title="props.title"
    @click="toggle"
  />
</template>
