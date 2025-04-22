<script setup lang="ts">
const emit = defineEmits<{
  click: [void]
}>()
</script>

<template>
  <div
    class="
      @xs/trnForm:w-14 @sm/trnForm:w-16
      flex aspect-square w-12
      items-center
      justify-center
      rounded-full
      bg-item-3 p-1 font-secondary
      text-2xl
      font-normal
      text-2 transition
      hover:scale-[1.02]
      hover:border-item-6
      hover:bg-[var(--item-5)]
    "
    tabindex="0"
    @click="() => emit('click')"
  >
    <slot />
  </div>
</template>
