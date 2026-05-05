<script setup lang="ts">
const props = defineProps<{
  isActive?: boolean
}>()

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <div
    :class="cn(
      'flex flex-1 min-h-[32px] select-none items-center justify-center gap-1 text-nowrap rounded-xl px-2 text-sm',
      props.isActive ? 'bg-accented text-primary' : 'interactive text-muted',
    )"
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
