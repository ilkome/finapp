<script setup lang="ts">
import type { TrnId, TrnItemFull } from '~/components/trns/types'
import useTrn from '~/components/trns/item/useTrn'

const props = withDefaults(
  defineProps<{
    trnsIds: TrnId[]
  }>(),
  {
  },
)

const { formatTrnItem } = useTrn()
const trns = computed(() =>
  props.trnsIds
    .map(id => formatTrnItem(id))
    .filter(trn => trn?.id) as TrnItemFull[],
)
</script>

<template>
  <div>
    <TrnsItem2
      v-for="trn in trns"
      :key="trn.id"
      :trnId="trn.id"
      :trn="trn"
    />
  </div>
</template>
