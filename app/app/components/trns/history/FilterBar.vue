<script setup lang="ts">
import type { HistoryDescriptionFilter } from '~/components/trns/history/types'
import type { TrnsViewType } from '~/components/trns/types'

import { historyFiltersKey } from '~/components/trns/history/injectionKeys'

const filters = inject(historyFiltersKey)!
const { t } = useI18n()

const typeItems = computed(() => [
  { label: t('trns.historyTable.filters.allTypes'), value: 'all' },
  { label: t('trns.historyTable.types.expense'), value: 'expense' },
  { label: t('trns.historyTable.types.income'), value: 'income' },
  { label: t('trns.historyTable.types.transfer'), value: 'transfer' },
  { label: t('trns.historyTable.types.adjustment'), value: 'adjustment' },
])

const descriptionItems = computed(() => [
  { label: t('trns.historyTable.filters.allDescriptions'), value: 'all' },
  { label: t('trns.historyTable.filters.withDescription'), value: 'with' },
  { label: t('trns.historyTable.filters.withoutDescription'), value: 'without' },
])
</script>

<template>
  <div class="grid gap-2 px-2 pb-2 md:px-3 md:pb-3">
    <UInput
      v-model="filters.searchInput.value"
      class="w-full"
      icon="i-lucide-search"
      :placeholder="t('trns.historyTable.filters.search')"
      size="xl"
    >
      <template v-if="filters.searchInput.value" #trailing>
        <UButton
          :aria-label="t('base.clear')"
          color="neutral"
          icon="i-lucide-x"
          size="sm"
          variant="link"
          @click="filters.searchInput.value = ''"
        />
      </template>
    </UInput>

    <div class="history-filter-scroll -mx-2 flex min-w-0 snap-x snap-mandatory scroll-px-2 items-center gap-2 overflow-x-auto px-2 md:-mx-3 md:scroll-px-3 md:px-3">
      <UiActionButton
        v-if="filters.hasFilters.value"
        class="shrink-0 snap-start snap-always"
        :ariaLabel="t('base.reset')"
        @click="filters.clear"
      >
        <Icon name="lucide:rotate-ccw" size="18" />
      </UiActionButton>

      <TrnsHistorySelectFilter
        class="shrink-0 snap-start snap-always"
        :items="typeItems"
        :modelValue="filters.type.value"
        :title="t('trns.historyTable.filters.allTypes')"
        @update:modelValue="filters.setType($event as TrnsViewType)"
      />

      <TrnsHistorySelectFilter
        class="shrink-0 snap-start snap-always"
        :items="descriptionItems"
        :modelValue="filters.description.value"
        :title="t('trns.historyTable.filters.allDescriptions')"
        @update:modelValue="filters.setDescription($event as HistoryDescriptionFilter)"
      />

      <FilterButton class="shrink-0 snap-start snap-always" />
      <TrnsHistoryPeriodFilter class="shrink-0 snap-start snap-always" />
      <TrnsHistoryAmountFilter class="shrink-0 snap-start snap-always" />

      <FilterSelected
        v-if="filters.entityFilter.isShow.value"
        class="snap-start snap-always *:snap-start *:snap-always"
        isShowCategories
        isShowWallets
      />
    </div>
  </div>
</template>

<style scoped>
.history-filter-scroll {
  scrollbar-width: none;
}

.history-filter-scroll::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
</style>
