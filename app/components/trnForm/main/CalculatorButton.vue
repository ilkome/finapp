<script setup lang="ts">
const emit = defineEmits<{
  click: [void]
}>()
</script>

<template>
  <div
    class="
      @xs/trnForm:w-14 @sm/trnForm:w-16
      bg-item-4 font-secondary text-2
      hocus:scale-[1.02]
      hocus:border-item-6
      hocus:bg-item-hover
      flex aspect-square w-12
      items-center
      justify-center
      rounded-full p-1
      text-2xl
      font-normal
      transition
    "
    tabindex="0"
    @click="() => emit('click')"
  >
    <slot />
  </div>
</template>
