<script setup lang="ts">
const emit = defineEmits<{
  click: [void]
}>()
</script>

<template>
  <div
    class="
      _md:max-w-[44px] _max-w-[64px] @xs/trnForm:w-14 @sm/trnForm:w-16
      _@md/trnForm:w-20 flex aspect-square w-12 items-center
      justify-center
      rounded-full
      border
      border-item-6 bg-item-4 p-1
      font-secondary
      text-2xl
      font-normal text-2 transition
      hocus:scale-[1.02]
      hocus:border-item-6
      hocus:bg-item-5
    "
    tabindex="0"
    @click="() => emit('click')"
  >
    <slot />
  </div>
</template>
