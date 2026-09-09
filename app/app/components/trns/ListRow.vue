<script setup lang="ts">
import type { TrnsDisplayRow } from '~/components/trns/listRows'
import type { TrnId } from '~/components/trns/types'

import { useAmount } from '~/components/amount/useAmount'
import { trnsSelectionKey } from '~/components/trns/injectionKeys'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useDateFormats } from '~/composables/useDateFormats'

const props = defineProps<{
  allowCreateFromDate?: boolean
  compact?: boolean
  isShowGroupSum?: boolean
  row: TrnsDisplayRow
}>()

const emit = defineEmits<{
  click: [trnId: TrnId]
  clickDate: [date: number]
}>()

const trnsStore = useTrnsStore()
const selection = inject(trnsSelectionKey, null)
const { computeTotalForTrnsIds } = useAmount()
const { formatDate } = useDateFormats()

const trnItem = computed(() => props.row.type === 'transaction'
  ? trnsStore.computeTrnItem(props.row.trnId)
  : null)

// While a selection is active the date header selects or deselects the whole day.
function onClickDate() {
  if (props.row.type !== 'dateHeader')
    return

  if (selection?.count.value) {
    selection.toggleMany(props.row.trnsIds)
    return
  }

  if (props.allowCreateFromDate)
    emit('clickDate', props.row.date)
}

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
      @click="onClickDate"
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
    :trnId="row.trnId"
    :trnItem="trnItem"
    class="group"
    @click="emit('click', row.trnId)"
  />
</template>
