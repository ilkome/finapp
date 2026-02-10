<script setup lang="ts">
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const { onClose, trnFormCreate, ui } = useTrnsFormStore()
</script>

<template>
  <div
    v-if="!ui.isShow"
    class="
      group fixed top-0 right-0 h-full w-[300px] items-end
      justify-end from-transparent to-[var(--item-5)]
      transition hover:bg-gradient-to-r xl:flex
    "
    @click="ui.isShow ? onClose() : trnFormCreate()"
  >
    <div
      class="
        text-icon-primary sticky right-0
        bottom-0 flex items-center
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
