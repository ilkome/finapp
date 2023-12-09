<script setup lang="ts">
defineProps<{
  isActive?: boolean
}>()

const emit = defineEmits(['click'])
</script>

<template>
  <div
    :class="{
      '!bg-item-main-active !text-accent-default !cursor-default': isActive,
    }"
    class="
      cursor-pointer select-none
      grow py-3 px-2 flex gap-1 items-center justify-center
      text-primary/80 text-sm
      hocus_bg-item-main-hover
      @4xl/tabs_text-lg @4xl/tabs_p-3
      transition
    "
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
