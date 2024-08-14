<script setup lang="ts">
import type { TrnId, TrnItemFull } from '~/components/trns/types'
import { useTrnForm } from '~/components/trnForm/useTrnForm'

const props = defineProps<{
  alt?: boolean
  date?: string
  trnId: TrnId
  trnItem: TrnItemFull
}>()

const { trnFormEdit } = useTrnForm()
</script>

<template>
  <TrnsItem
    :alt="props.alt"
    :trnItem
    :date
    @click="trnFormEdit(trnId)"
  />
</template>
