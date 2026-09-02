<script setup lang="ts">
const { isActive = false } = defineProps<{
  isActive?: boolean
}>()
</script>

<template>
  <UiText
    as="div"
    class="theme-rounded-control flex min-h-10.5 min-w-10.5 grow-0! items-center gap-1 interactive bg-elevated px-3 pr-2! pb-0"
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
