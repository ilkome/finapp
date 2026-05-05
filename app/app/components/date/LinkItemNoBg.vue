<script setup lang="ts">
const props = defineProps<{
  isActive?: boolean
}>()
</script>

<template>
  <div
    :class="cn('flex min-h-[32px] items-center justify-center rounded-full px-1 text-xs leading-none text-nowrap text-default',
               props.isActive && 'text-primary bg-elevated',
    )"
  >
    <slot />
  </div>
</template>
