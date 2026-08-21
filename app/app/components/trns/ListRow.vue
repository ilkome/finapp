<script setup lang="ts">
import type { TrnsDisplayRow } from '~/components/trns/listRows'
import type { TrnId } from '~/components/trns/types'

import { useAmount } from '~/components/amount/useAmount'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useDateFormats } from '~/composables/useDateFormats'

const props = defineProps<{
  allowCreateFromDate?: boolean
  compact?: boolean
  isShowGroupSum?: boolean
  row: TrnsDisplayRow
  selectable?: boolean
  selectedTrnIds?: TrnId[]
}>()

const emit = defineEmits<{
  click: [trnId: TrnId]
  clickDate: [date: number]
  toggleSelect: [trnId: TrnId]
}>()

const trnsStore = useTrnsStore()
const { computeTotalForTrnsIds } = useAmount()
const { formatDate } = useDateFormats()

const trnItem = computed(() => props.row.type === 'transaction'
  ? trnsStore.computeTrnItem(props.row.trnId)
  : null)

const rowTotal = computed(() => props.row.type === 'dateHeader' && props.row.trnsIds.length > 1
  ? computeTotalForTrnsIds(props.row.trnsIds)
  : null)
</script>

<template>
  <div
    v-if="row.type === 'dateHeader'"
    :class="{ 'border-accented': isShowGroupSum && row.trnsIds.length > 1 }"
    class="flex items-center gap-2 px-3 pt-3 pb-1"
  >
    <TrnsDateHeader
      :date="row.date"
      class="grow"
      @click="allowCreateFromDate && emit('clickDate', row.date)"
    />

    <div
      v-if="isShowGroupSum && rowTotal"
      class="opacity-60"
    >
      <TrnsListGroupSum
        :expense="rowTotal.expense"
        :income="rowTotal.income"
      />
    </div>
  </div>

  <TrnsItemWrap
    v-else-if="trnItem"
    :compact="compact"
    :date="(formatDate(trnItem.date, 'trnItem') as string)"
    :isSelected="selectedTrnIds?.includes(row.trnId)"
    :selectable="selectable"
    :trnId="row.trnId"
    :trnItem="trnItem"
    class="group"
    @click="emit('click', row.trnId)"
    @toggleSelect="emit('toggleSelect', row.trnId)"
  />
</template>
