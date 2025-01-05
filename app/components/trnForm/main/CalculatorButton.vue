<script setup lang="ts">
const emit = defineEmits<{
  click: [void]
}>()
</script>

<template>
  <div
    class="
      border-item-6 font-secondary text-2 bg-item-4
      hocus:bg-item-5 hocus:border-item-6 hocus:scale-[1.02] flex aspect-square
      w-full max-w-[64px] grow
      items-center justify-center rounded-full border
      p-1
      text-2xl font-normal transition
      md:max-w-[44px]
    "
    tabindex="0"
    @click="() => emit('click')"
  >
    <slot />
  </div>
</template>
