<script setup lang="ts">
import type { TrnId, TrnItemFull } from '~/components/trns/types'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  alt?: boolean
  date?: string
  trnId: TrnId
  trnItem: TrnItemFull
}>()

const { trnFormEdit } = useTrnsFormStore()
</script>

<template>
  <TrnsItem
    :alt="props.alt"
    :trnItem
    :date
    @click="trnFormEdit(trnId)"
  />
</template>
