<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { onClose, trnFormCreate, ui } = useTrnsFormStore()
</script>

<template>
  <div
    class="
      group absolute bottom-0 right-0 z-20 hidden h-full items-end justify-center transition
      hover:bg-[var(--item-5)] 2xl:flex
    "
    @click="ui.isShow ? onClose() : trnFormCreate()"
  >
    <div
      class="
        _group-hover:bg-(--ui-primary)
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
