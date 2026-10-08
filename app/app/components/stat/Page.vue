<script setup lang="ts">
import type { Range } from '~~/utils/date/types'

import { useStatPageFilter } from '~/components/filter/useStatPageFilter'
import { useLoansStore } from '~/components/loans/useLoansStore'
import { calculateBestGranularityBy } from '~/components/stat/date/params'
import { resolveStatSelectionRange } from '~/components/stat/date/selectionRange'
import { useStatPageHost } from '~/components/stat/page/useStatPageHost'
import { useStatPageProviders } from '~/components/stat/useStatPageProviders'
import { useStatPageViews } from '~/components/stat/views/useStatPageViews'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useFeature } from '~/composables/useFeatures'

const { t } = useI18n()
const route = useRoute()
const trnsStore = useTrnsStore()

const { statHeader } = useStatPageHost()

const storageKey = 'dashboard'

const { filter, filterTrnsIds } = useStatPageFilter({ storageKey })

const trnsIds = computed(() => filterTrnsIds())
const walletSourceTrnsIds = computed(() => filterTrnsIds({ walletsIds: undefined }))

const baseMaxRange = computed(() => trnsStore.getRange(walletSourceTrnsIds.value))
const contextualMaxRange = shallowRef<Range | null>(null)
const maxRange = computed(() => contextualMaxRange.value ?? baseMaxRange.value)

const loansStore = useLoansStore()
const isLoans = useFeature('loans')

const { contentWidth, statConfig, statDate } = useStatPageProviders({
  config: { stableStorage: true, storageKey },
  contextBlockIds: () => isLoans.value && loansStore.dueThisMonth ? ['loansDue'] : [],
  date: { key: storageKey, maxRange, queryParams: () => route.query },
  filter,
})
const contextRange = computed(() => resolveStatSelectionRange(
  statDate.range.value,
  statDate.selectedInterval.value,
  statDate.params.value.intervalSelected,
))

watch(contextualMaxRange, (range) => {
  if (!statDate.params.value.isShowMaxRange)
    return
  const granularityBy = calculateBestGranularityBy(range ?? baseMaxRange.value)
  if (statDate.params.value.granularityBy !== granularityBy || statDate.params.value.granularityDuration !== 1)
    statDate.setGranularity({ granularityBy, granularityDuration: 1 })
}, { immediate: true })

const { hiddenPanels } = useStatPageViews({
  contentWidth,
  filter,
  range: contextRange,
  statConfig,
  trnsIds,
})

watch(filter.categoriesIds, () => {
  statConfig.config.value.categories.isShowEmpty = filter.categoriesIds.value.length > 0
})
</script>

<template>
  <UiPage>
    <StatHeader
      ref="statHeader"
    >
      <template #title>
        <UiHeaderTitle>{{ t('stat.title') }}</UiHeaderTitle>
      </template>
    </StatHeader>

    <StatLayout
      :hiddenPanels
      :storageKey
      :trnsIds
      :walletSourceTrnsIds
      hasChildren
      showWallets
      @contextualMaxRange="contextualMaxRange = $event"
    >
      <template #loansDue>
        <LoansDueThisMonth class="max-w-sm" />
      </template>
    </StatLayout>
  </UiPage>
</template>
