<script setup lang="ts">
import type { MiniItemConfig } from '~/components/stat/useStatConfig'

import { statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  configKey: keyof MiniItemConfig
  field?: string
  title: string
}>()

const statConfig = inject(statConfigKey)!

const isChecked = computed((): boolean => {
  const val = statConfig.config.value[props.configKey]
  if (props.field && typeof val === 'object')
    return (val as Record<string, boolean>)[props.field] ?? false
  return val as boolean
})

function toggle() {
  if (props.field)
    statConfig.updateConfig(props.configKey, { [props.field]: !isChecked.value })
  else
    statConfig.updateConfig(props.configKey, !isChecked.value)
}
</script>

<template>
  <UiSwitchItem
    :checkboxValue="isChecked"
    :title="props.title"
    @click="toggle"
  />
</template>
