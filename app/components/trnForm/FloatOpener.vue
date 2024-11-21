<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { trnFormCreate } = useTrnsFormStore()
</script>

<template>
  <div
    class="flex-end group absolute bottom-6 right-6 z-10 hidden justify-center lg:flex "
    @click="trnFormCreate"
  >
    <div
      class="
        bg-accent-2
        text-icon-primary
        flex size-12 items-center
        justify-center rounded-full
        text-3xl transition
        group-hover:scale-125"
    >
      <i class="mdi mdi-plus" />
    </div>
  </div>
</template>
