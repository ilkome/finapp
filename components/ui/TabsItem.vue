<script setup lang="ts">
defineProps<{
  isActive?: boolean
}>()

const emit = defineEmits(['click'])
</script>

<template>
  <div
    :class="{
      '!bg-item-3 !text-primary': isActive,
    }"
    class="
      select-none
      grow py-3 px-2 flex gap-1 items-center justify-center
      text-primary/80 text-sm
      hocus_bg-item-5
      @4xl/tabs_text-lg @4xl/tabs_p-3
    "
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
