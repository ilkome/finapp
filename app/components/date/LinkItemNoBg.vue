<script setup lang="ts">
const props = defineProps<{
  isActive?: boolean
}>()
</script>

<template>
  <div
    :class="cn('flex min-h-[32px] items-center justify-center rounded-full px-1 text-xs leading-none text-nowrap text-(--ui-text)',
               props.isActive && 'text-primary bg-(--item-5)',
    )"
  >
    <slot />
  </div>
</template>
