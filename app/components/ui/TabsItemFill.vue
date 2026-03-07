<script setup lang="ts">
const props = defineProps<{
  isActive?: boolean
}>()

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <div
    :class="cn(
      'flex flex-1 min-h-[32px] select-none items-center justify-center gap-1 text-nowrap rounded px-2 text-sm text-3 hover:bg-(--item-5)',
      props.isActive && 'bg-item-4',
    )"
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
