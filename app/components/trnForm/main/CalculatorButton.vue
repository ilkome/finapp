<script setup lang="ts">
const emit = defineEmits<{
  click: [void]
}>()
</script>

<template>
  <div
    class="
      bg-item-3 font-secondary
      text-2 hover:border-item-6 flex
      aspect-square
      w-12
      items-center
      justify-center rounded-full p-1
      text-2xl
      font-normal
      transition hover:scale-[1.02]
      hover:bg-[var(--item-5)]
      @xs/trnForm:w-14
      @sm/trnForm:w-16
    "
    tabindex="0"
    @click="() => emit('click')"
  >
    <slot />
  </div>
</template>
