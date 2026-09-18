<script setup lang="ts">
import type { StatBlockPanelId } from '~/components/stat/views/types'

import { useStatPageFilter } from '~/components/filter/useStatPageFilter'
import { statHiddenPanelsKey } from '~/components/stat/injectionKeys'
import { useStatPageHost } from '~/components/stat/page/useStatPageHost'
import { useStatPageProviders } from '~/components/stat/useStatPageProviders'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

defineOptions({ name: 'History' })

const { t } = useI18n()
const route = useRoute()
const trnsStore = useTrnsStore()

const storageKey = 'history'
const hiddenPanels: StatBlockPanelId[] = ['wallets', 'chart', 'vertical', 'catsRound', 'catsList', 'statAverage']

const { statHeader } = useStatPageHost()
const { filter, filterTrnsIds } = useStatPageFilter({ storageKey })

const trnsIds = computed(() => filterTrnsIds())
const maxRange = computed(() => trnsStore.getRange(trnsIds.value))

useStatPageProviders({
  config: { stableStorage: true, storageKey },
  date: { initParams: { granularityBy: 'month', isShowMaxRange: true }, key: storageKey, maxRange, queryParams: () => route.query },
  filter,
})
provide(statHiddenPanelsKey, hiddenPanels)

useHead({ title: t('trns.history') })
</script>

<template>
  <UiPage>
    <StatHeader ref="statHeader" compactBottom>
      <template #title>
        <UiHeaderTitle>{{ t('trns.history') }}</UiHeaderTitle>
      </template>
    </StatHeader>

    <StatLayout
      :hiddenPanels
      :storageKey
      :trnsIds
      isShowSearch
    />
  </UiPage>
</template>
