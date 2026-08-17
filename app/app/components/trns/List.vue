<script setup lang="ts">
import type { TrnsDisplayRow } from '~/components/trns/listRows'
import type { TrnId, TrnsListFilterState } from '~/components/trns/types'

import { useAmount } from '~/components/amount/useAmount'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { buildTrnsDisplayRows } from '~/components/trns/listRows'
import { useTrnsListFilters } from '~/components/trns/useTrnsListFilters'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const {
  compact,
  filterState,
  isShowDates,
  isShowExpense,
  isShowFilterByDesc,
  isShowFilterByType,
  isShowGroupSum,
  isShowHeader,
  isShowIncome,
  isShowTransfers,
  selectable,
  selectedTrnIds = [],
  size = 30,
  trnsIds = [],
} = defineProps<{
  compact?: boolean
  filterState?: TrnsListFilterState
  isShowDates?: boolean
  isShowExpense?: boolean
  isShowFilterByDesc?: boolean
  isShowFilterByType?: boolean
  isShowGroupSum?: boolean
  isShowHeader?: boolean
  isShowIncome?: boolean
  isShowTransfers?: boolean
  selectable?: boolean
  selectedTrnIds?: TrnId[]
  size?: number
  trnsIds?: TrnId[]
}>()

const emit = defineEmits<{
  click: []
  toggleSelect: [id: TrnId]
}>()

const trnsStore = useTrnsStore()
const trnsFormStore = useTrnsFormStore()

const { computeTotalForTrnsIds } = useAmount()
const { t } = useI18n()
const pageNumber = ref(1)

const {
  filterBy,
  isAllTrnsWithDesc,
  isShowWithDesc,
  isTrnsWithDesc,
  realTypesCount,
  selectedIds,
  setFilterBy,
  typeFilterItems,
} = useTrnsListFilters({
  ids: computed(() => trnsIds),
  showExpense: computed(() => !!isShowExpense),
  showIncome: computed(() => !!isShowIncome),
  showTransfers: computed(() => !!isShowTransfers),
  state: filterState,
})

const paginatedTrnsIds = computed(() => selectedIds.value.slice(0, pageNumber.value * size))

const isShowedAllTrns = computed(() => paginatedTrnsIds.value.length === selectedIds.value.length)

const displayRows = computed(() => buildTrnsDisplayRows(paginatedTrnsIds.value, trnsStore.items))

const groupedDisplayRows = computed(() => {
  const groups: {
    header: Extract<TrnsDisplayRow, { type: 'dateHeader' }>
    transactions: Extract<TrnsDisplayRow, { type: 'transaction' }>[]
  }[] = []

  for (const row of displayRows.value) {
    if (row.type === 'dateHeader') {
      groups.push({ header: row, transactions: [] })
      continue
    }

    groups.at(-1)?.transactions.push(row)
  }

  return groups
})

const paginatedTotal = computed(() => computeTotalForTrnsIds(paginatedTrnsIds.value))

function onOpenTrnForm(date: number) {
  trnsFormStore.openFormForCreate()
  trnsFormStore.$patch((state) => {
    state.values.date = date
  })
}
</script>

<template>
  <div class="min-w-0">
    <!-- Header -->
    <slot
      v-if="isShowHeader"
      name="header"
      :paginatedTrnsIds
      :selectedIds
    >
      <UiTitleCollapse isHideArrow>
        {{ t('trns.title') }} {{ selectedIds.length > 0 ? selectedIds.length : '' }}
      </UiTitleCollapse>
    </slot>

    <slot name="contentBefore" />

    <TrnsListFilterControls
      :filterBy
      :isAllTrnsWithDesc
      :isShowFilterByDesc
      :isShowFilterByType
      :isShowWithDesc
      :isTrnsWithDesc
      :realTypesCount
      :selectedCount="selectedIds.length"
      :typeFilterItems
      @setFilterBy="setFilterBy"
      @update:isShowWithDesc="isShowWithDesc = $event"
    />

    <!-- No Trns -->
    <TrnsNoTrns v-if="isShowDates && selectedIds.length === 0" />

    <!-- Hide dates -->
    <div v-if="!isShowDates">
      <!-- Group Sum -->
      <div
        v-if="isShowGroupSum && paginatedTrnsIds.length > 1"
        class="border-b border-accented pr-3 pb-2 opacity-60"
      >
        <TrnsListGroupSum
          :expense="paginatedTotal.expense"
          :income="paginatedTotal.income"
        />
      </div>

      <template v-for="row in displayRows" :key="row.id">
        <TrnsListRow
          v-if="row.type === 'transaction'"
          :compact="compact"
          :row
          :selectable="selectable"
          :selectedTrnIds
          @click="emit('click')"
          @toggleSelect="emit('toggleSelect', $event)"
        />
      </template>
    </div>

    <!-- With dates -->
    <div
      v-if="isShowDates"
      class="grid gap-1"
    >
      <div
        v-for="group in groupedDisplayRows"
        :key="group.header.id"
        class="_rounded-lg _border-b overflow-hidden border-accented pb-2 last:border-b-0 last:pb-px"
      >
        <TrnsListRow
          :allowCreateFromDate="true"
          :isShowGroupSum
          :row="group.header"
          @clickDate="onOpenTrnForm"
        />

        <div>
          <TrnsListRow
            v-for="trnRow in group.transactions"
            :key="trnRow.id"
            :compact="compact"
            :row="trnRow"
            :selectable="selectable"
            :selectedTrnIds
            @click="emit('click')"
            @toggleSelect="emit('toggleSelect', $event)"
          />
        </div>
      </div>
    </div>

    <!-- Show all -->
    <div
      v-if="!isShowedAllTrns"
      class="px-2 pt-1"
    >
      <div
        class="flex-center rounded-sm bg-elevated px-5 py-2 text-sm text-muted hover:bg-accented"
        @click="pageNumber = ++pageNumber"
      >
        {{ t('trns.more') }} {{ paginatedTrnsIds.length }} /
        {{ selectedIds.length }}
      </div>
    </div>
  </div>
</template>
