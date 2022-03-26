<script setup lang="ts">
defineProps<{
  isActive?: boolean
}>()

const emit = defineEmits(['click'])
</script>

<template lang="pug">
.cursor-pointer.px-5.py-3.grow.whitespace-nowrap.hocus_bg-skin-item-main-hover(
  :class="{ 'cursor-default text-skin-accent-base !bg-gray-300 dark_!bg-232323': isActive }"
  @click="emit('click')"
)
  slot
</template>
