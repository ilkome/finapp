<script setup lang="ts">
defineProps<{
  isActive?: boolean
}>()

const emit = defineEmits(['click'])
</script>

<template>
  <div
    :class="{
      '!cursor-default !bg-item-main-active !text-accent-default': isActive,
    }"
    class="
      cursor-pointer select-none
      py-2 px-3 flex gap-1 items-center justify-center
      border-1 rounded-md
      text-secondary/70 text-sm leading-none
      hocus_bg-item-main-hover
      transition
    "
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
