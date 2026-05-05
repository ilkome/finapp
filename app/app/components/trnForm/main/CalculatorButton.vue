<script setup lang="ts">
const emit = defineEmits<{
  click: [void]
}>()
</script>

<template>
  <div
    class="
      bg-elevated/50 font-secondary
      hover:border-default hover:bg-elevated
      text-muted
      flex
      aspect-square
      w-12 items-center justify-center
      rounded-full
      p-1 text-2xl
      font-normal transition
      hover:scale-[1.02]
      @xs/trnForm:w-14
      @sm/trnForm:w-16
    "
    tabindex="0"
    @click="() => emit('click')"
  >
    <slot />
  </div>
</template>
