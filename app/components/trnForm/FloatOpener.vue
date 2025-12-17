<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { onClose, trnFormCreate, ui } = useTrnsFormStore()
</script>

<template>
  <div
    class="
      group absolute right-0 bottom-0 hidden h-full w-[300px] items-end justify-end
      transition hover:bg-[var(--item-5)] xl:flex
    "
    @click="ui.isShow ? onClose() : trnFormCreate()"
  >
    <div
      class="
        text-icon-primary flex items-center
        justify-center rounded-full
        px-4 py-5 text-2xl
        opacity-70
        transition
        group-hover:scale-125
        group-hover:opacity-100
      "
    >
      <Icon name="hugeicons:plus-sign-square" />
    </div>
  </div>
</template>
