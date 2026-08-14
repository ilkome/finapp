<script setup lang="ts">
const { isActive = false } = defineProps<{
  isActive?: boolean
}>()
</script>

<template>
  <div
    class="flex min-h-10.5 min-w-10.5 grow-0! items-center gap-1 rounded-full interactive bg-elevated px-3 pr-2!  pb-0 text-sm leading-none font-semibold"
  >
    <slot />
    <Icon
      name="lucide:chevron-down"
      size="16"
      class="shrink-0 text-muted transition-transform"
      :class="isActive && 'rotate-180'"
    />
  </div>
</template>
