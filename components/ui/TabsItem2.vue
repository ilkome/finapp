<script setup lang="ts">
defineProps<{
  isActive?: boolean
}>()

const emit = defineEmits(['click'])
</script>

<template lang="pug">
.cursor-pointer.max-w-xs.px-5.py-3.whitespace-nowrap.text-skin-item-base-down.border-b-2.border-skin-item-main-hover(
  :class="{ 'cursor-default text-skin-item-base-up !border-skin-accent-base': isActive }"
  @click="emit('click')"
)
  slot
</template>
