<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { trnFormCreate } = useTrnsFormStore()
</script>

<template>
  <div
    class="
      group absolute bottom-0 right-0 z-20 hidden h-dvh items-end justify-center transition
      hover:bg-item-5 2xl:flex
    "
    @click="trnFormCreate"
  >
    <div
      class="
        _group-hover:bg-accent-1
        flex items-center justify-center
        rounded-full px-3
        py-4 text-2xl text-icon-primary
        transition
        group-hover:scale-125
      "
    >
      <Icon name="hugeicons:plus-sign-square" />
    </div>
  </div>
</template>
