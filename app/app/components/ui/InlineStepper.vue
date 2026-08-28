<script setup lang="ts">
defineProps<{
  value: number
}>()

const emit = defineEmits<{
  dec: []
  inc: []
}>()
</script>

<template>
  <div class="flex gap-1 rounded-sm border border-default bg-default p-px">
    <button
      type="button"
      class="flex min-h-8 min-w-8 items-center justify-center rounded-sm interactive text-xs leading-none"
      @click="emit('dec')"
    >
      -
    </button>
    <div class="flex min-h-8 min-w-6 items-center justify-center rounded-full px-1 text-xs leading-none text-default">
      {{ value }}
    </div>
    <button
      type="button"
      class="flex min-h-8 min-w-8 items-center justify-center rounded-sm interactive text-xs leading-none"
      @click="emit('inc')"
    >
      +
    </button>
  </div>
</template>
