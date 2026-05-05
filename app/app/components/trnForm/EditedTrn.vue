<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const trnsStore = useTrnsStore()
const trnsFormStore = useTrnsFormStore()
</script>

<template>
  <div
    v-if="trnsFormStore.values.trnId"
    class="px-3"
  >
    <TrnsItem
      v-if="trnsStore.computeTrnItem(trnsFormStore.values.trnId)"
      :trnItem="trnsStore.computeTrnItem(trnsFormStore.values.trnId)!"
      class="group bg-elevated/50 rounded-lg"
      @click="trnsFormStore.values.trnId = null"
    />
  </div>
</template>
