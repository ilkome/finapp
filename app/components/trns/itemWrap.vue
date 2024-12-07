<script setup lang="ts">
import type { TrnId, TrnItemFull } from '~/components/trns/types'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  alt?: boolean
  date?: string
  trnId: TrnId
  trnItem: TrnItemFull
}>()

const emit = defineEmits<{
  click: []
}>()

const { trnFormEdit } = useTrnsFormStore()

function click() {
  emit('click')
  trnFormEdit(props.trnId)
}
</script>

<template>
  <TrnsItem
    :alt="props.alt"
    :trnItem
    :date
    @click="click"
  />
</template>
