<script setup lang="ts">
const props = withDefaults(defineProps<{
  as?: string
  variant?: 'compact' | 'heading' | 'primary' | 'secondary'
}>(), {
  as: 'span',
  variant: 'primary',
})

const variantClass = computed(() => ({
  compact: 'text-xs leading-none text-toned',
  heading: 'text-xl font-semibold text-highlighted',
  primary: 'text-sm leading-none font-medium tracking-wide text-toned',
  secondary: 'text-2xs leading-none text-muted',
})[props.variant])
</script>

<template>
  <component
    :is="props.as"
    class="inline-block max-w-full min-w-0 truncate"
    :class="variantClass"
  >
    <slot />
  </component>
</template>
