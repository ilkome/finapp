<script setup lang="ts">
import type { StatBlockPanelId } from '~/components/stat/views/types'

import { statConfigParameterIdsKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  panel: StatBlockPanelId
  parameterIds?: string[]
}>()

provide(statConfigParameterIdsKey, computed(() => props.parameterIds ? new Set(props.parameterIds) : null))
</script>

<template>
  <StatConfigPanelsWallets v-if="panel === 'wallets'" />
  <StatConfigPanelsAverage v-else-if="panel === 'statAverage'" />
  <StatConfigPanelsNavigation v-else-if="panel === 'navigation'" />
  <StatConfigPanelsSummary v-else-if="panel === 'summary'" />
  <StatConfigPanelsChart v-else-if="panel === 'chart'" />
  <StatConfigPanelsTrns v-else-if="panel === 'trns'" />
  <StatConfigPanelsCatsRound v-else-if="panel === 'catsRound'" />
  <StatConfigPanelsCatsList v-else-if="panel === 'catsList'" />
  <StatConfigPanelsVertical v-else-if="panel === 'vertical'" />
</template>
