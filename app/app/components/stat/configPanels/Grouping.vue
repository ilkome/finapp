<script setup lang="ts">
import type { GroupingMode } from '~/components/stat/useStatConfig'

import { statConfigKey } from '~/components/stat/injectionKeys'
import { groupingModes } from '~/components/stat/useStatConfig'

const { t } = useI18n()
const statConfig = inject(statConfigKey)!

const grouping = computed(() => statConfig.config.value.grouping)

function setGrouping(mode: GroupingMode) {
  statConfig.updateConfig('grouping', mode)
}
</script>

<template>
  <div class="grid gap-3">
    <UiTabsBar>
      <UiTabsItemPill
        v-for="mode in groupingModes"
        :key="mode"
        variant="outline"
        :isActive="grouping === mode"
        class="grow"
        @click="setGrouping(mode)"
      >
        {{ t(`stat.config.grouping.${mode}`) }}
      </UiTabsItemPill>
    </UiTabsBar>
  </div>
</template>
