<script setup lang="ts">
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    class="interactive bg-item-3 flex min-h-[38px] min-w-[42px] grow items-center justify-center rounded-sm px-2 py-1.5 text-sm"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
