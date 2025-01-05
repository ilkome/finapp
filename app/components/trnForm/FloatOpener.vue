<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { trnFormCreate } = useTrnsFormStore()
</script>

<template>
  <div
    class="
      flex-end hover:bg-item-5 group absolute bottom-0 right-0 z-20 hidden h-dvh items-end justify-center
      transition 2xl:flex
    "
    @click="trnFormCreate"
  >
    <div
      class="
        text-icon-primary
        _group-hover:bg-accent-1 flex items-center
        justify-center rounded-full
        px-3 py-4 text-2xl
        transition
        group-hover:scale-125
      "
    >
      <Icon name="hugeicons:plus-sign-square" />
    </div>
  </div>
</template>
