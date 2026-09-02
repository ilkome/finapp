<script setup lang="ts">
import type { StatBlockPanelId } from '~/components/stat/views/types'

import { PANELS } from '~/components/stat/config/panels/registry'
import { statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  panel: StatBlockPanelId
}>()

const statConfig = inject(statConfigKey)!
const panel = computed(() => PANELS[props.panel])
const isVisible = computed(() => panel.value.getIsShow(statConfig.config.value))

function toggle() {
  panel.value.setIsShow(statConfig, !isVisible.value)
}
</script>

<template>
  <UiSwitchItem
    :checkboxValue="isVisible"
    :title="$t('stat.views.blockRules.parameters.visibility')"
    trailing
    @click="toggle"
  />
</template>
