<script setup lang="ts">
defineProps<{
  isActive?: boolean
}>()

const emit = defineEmits(['click'])
</script>

<template lang="pug">
.cursor-pointer.max-w-xs.px-5.py-2.grow.whitespace-nowrap.hocus_bg-skin-item-main-hover(
  :class="{ 'cursor-default text-skin-accent-base !bg-skin-item-main-active': isActive }"
  @click="emit('click')"
)
  slot
</template>
