<script setup lang="ts">
const emit = defineEmits<{
  click: [void]
}>()
</script>

<template>
  <div
    class="
      hover:scale-1.02 flex
      aspect-square w-12
      items-center
      justify-center
      rounded-full
      bg-elevated/50 p-1 font-secondary
      text-2xl
      font-normal text-muted
      transition hover:border-default
      hover:bg-elevated
      @xs/trnForm:w-14
      @sm/trnForm:w-16
    "
    tabindex="0"
    @click="() => emit('click')"
  >
    <slot />
  </div>
</template>
