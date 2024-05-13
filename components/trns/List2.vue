<script setup lang="ts">
import type { TrnId, TrnItemFull } from '~/components/trns/types'
import useTrn from '~/components/trns/useTrn'

const props = withDefaults(
  defineProps<{
    trnsIds: TrnId[]
  }>(),
  {
  },
)

const { formatDate, formatTrnItem } = useTrn()
const trns = computed(() =>
  props.trnsIds
    .map(id => formatTrnItem(id))
    .filter(trn => trn?.id) as TrnItemFull[],
)
</script>

<template>
  <div>
    <TrnsItem2
      v-for="trnItem in trns"
      :key="trnItem.id"
      :trnId="trnItem.id"
      :trnItem="trnItem"
      :date="$t(formatDate(trnItem.date, 'trnItem'))"
    />
  </div>
</template>
