<script setup lang="ts">
const { isActive = false } = defineProps<{
  isActive?: boolean
}>()
</script>

<template>
  <UiTitleCollapse
    class="text-md grow-0! bg-elevated pr-2!"
    isShown
  >
    <span class="flex items-center gap-1 text-xs font-medium tracking-normal md:text-base md:font-semibold md:tracking-wide">
      <slot />
      <Icon
        name="lucide:chevron-down"
        size="16"
        class="shrink-0 text-muted transition-transform"
        :class="isActive && 'rotate-180'"
      />
    </span>
  </UiTitleCollapse>
</template>
