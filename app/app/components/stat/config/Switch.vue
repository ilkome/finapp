<script setup lang="ts">
import type { StatConfigBooleanPath } from '~/components/stat/config/switches'

import { STAT_CONFIG_BOOLEAN_OPERATIONS } from '~/components/stat/config/switches'
import { statConfigKey, statConfigParameterIdsKey, statConfigParameterRemoveKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  disabled?: boolean
  path: StatConfigBooleanPath
  title: string
}>()

const statConfig = inject(statConfigKey)!
const parameterIds = inject(statConfigParameterIdsKey, computed(() => null))
const removeParameter = inject(statConfigParameterRemoveKey, null)

const operation = computed(() => STAT_CONFIG_BOOLEAN_OPERATIONS[props.path])
const isChecked = computed(() => operation.value.get(statConfig.config.value))
const isVisible = computed(() => !parameterIds.value || parameterIds.value.has(props.path))

function toggle() {
  if (props.disabled)
    return
  operation.value.set(statConfig, !isChecked.value)
}
</script>

<template>
  <div
    v-if="isVisible"
    class="flex min-w-0 items-center gap-1"
    :class="removeParameter && 'rounded-sm pr-2 hover:bg-elevated/50'"
  >
    <UiSwitchItem
      :class="removeParameter && 'hover:bg-transparent!'"
      :checkboxValue="isChecked"
      :disabled="props.disabled"
      :title="props.title"
      trailing
      @click="toggle"
    />
    <UButton
      v-if="removeParameter"
      :aria-label="$t('stat.views.blockRules.removeParameter')"
      color="error"
      icon="i-lucide-x"
      size="xs"
      variant="ghost"
      @click="removeParameter(props.path)"
    />
  </div>
</template>
