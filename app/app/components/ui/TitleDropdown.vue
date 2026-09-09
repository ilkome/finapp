<script setup lang="ts">
const { isActive = false } = defineProps<{
  isActive?: boolean
}>()
</script>

<template>
  <UiText
    as="div"
    class="flex min-h-9 min-w-9 grow-0! items-center gap-1 theme-rounded-control interactive bg-elevated px-3 pr-2! pb-0"
    variant="control"
  >
    <slot />
    <Icon
      name="lucide:chevron-down"
      size="16"
      class="shrink-0 text-muted transition-transform"
      :class="isActive && 'rotate-180'"
    />
  </UiText>
</template>
