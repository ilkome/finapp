<script setup lang="ts">
import type { TrnId, TrnItemFull } from '~/components/trns/types'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const props = defineProps<{
  alt?: boolean
  date?: string
  trnId: TrnId
  trnItem: TrnItemFull
}>()

const { trnFormEdit } = useTrnFormStore()
</script>

<template>
  <TrnsItem
    :alt="props.alt"
    :trnItem
    :date
    @click="trnFormEdit(trnId)"
  />
</template>
