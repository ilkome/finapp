<script setup lang="ts">
import type { StatConfigBooleanPath } from '~/components/stat/config/switches'

import { STAT_CONFIG_BOOLEAN_OPERATIONS } from '~/components/stat/config/switches'
import { statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  path: StatConfigBooleanPath
  title: string
}>()

const statConfig = inject(statConfigKey)!

const operation = computed(() => STAT_CONFIG_BOOLEAN_OPERATIONS[props.path])
const isChecked = computed(() => operation.value.get(statConfig.config.value))

function toggle() {
  operation.value.set(statConfig, !isChecked.value)
}
</script>

<template>
  <UiSwitchItem
    :checkboxValue="isChecked"
    :title="props.title"
    @click="toggle"
  />
</template>
