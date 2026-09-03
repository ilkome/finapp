<script setup lang="ts">
import type { HistoryRowSelectionState } from '~/components/trns/history/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { filterKey } from '~/components/filter/injectionKeys'
import { historyFiltersKey } from '~/components/trns/history/injectionKeys'
import { buildTransactionHistoryRows } from '~/components/trns/history/rows'
import { useHistoryFilters } from '~/components/trns/history/useHistoryFilters'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { createLogger } from '~/utils/logger'

const { t } = useI18n()
const filters = useHistoryFilters()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()
const logger = createLogger('history-table')

provide(filterKey, filters.entityFilter)
provide(historyFiltersKey, filters)

useHead({
  title: t('trns.history'),
})

const historyRows = computed(() => buildTransactionHistoryRows({
  baseCurrency: currenciesStore.base,
  categories: categoriesStore.items,
  rates: currenciesStore.rates,
  trns: trnsStore.items ?? {},
  wallets: walletsStore.items ?? {},
}))

watch(() => historyRows.value.unresolvedIds, (ids) => {
  if (import.meta.dev && ids.length)
    logger.warn('unresolved transaction rows', ids)
}, { immediate: true })

const rowSelection = ref<HistoryRowSelectionState>({})
const filteredIds = ref<string[]>([])
const selectedIds = computed(() => Object.entries(rowSelection.value).filter(([, selected]) => selected).map(([id]) => id))

function removeAppliedSelection(ids: string[]) {
  const changed = new Set(ids)
  rowSelection.value = Object.fromEntries(Object.entries(rowSelection.value).filter(([id]) => !changed.has(id)))
}
</script>

<template>
  <UiPage>
    <UiHeader>
      <UiHeaderTitle>{{ t('trns.history') }}</UiHeaderTitle>
    </UiHeader>

    <div class="mb-4 grid h-[calc(100dvh-8rem)] min-h-96 page-wrapper grid-rows-[auto_auto_1fr] overflow-hidden">
      <TrnsHistoryFilterBar />

      <TrnsHistoryBulkToolbar
        v-if="selectedIds.length"
        :filteredCount="filteredIds.length"
        :selectedIds
        @applied="removeAppliedSelection"
        @clear="rowSelection = {}"
      />

      <TrnsHistoryTable
        v-model:rowSelection="rowSelection"
        :columnFilters="filters.columnFilters.value"
        :globalFilter="filters.search.value"
        :rows="historyRows.rows"
        @filteredIds="filteredIds = $event"
      />
    </div>
  </UiPage>
</template>
