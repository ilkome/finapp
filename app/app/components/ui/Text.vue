<script setup lang="ts">
const props = withDefaults(defineProps<{
  as?: string
  variant: 'caption' | 'control' | 'display' | 'meta' | 'navigation' | 'section'
}>(), {
  as: 'div',
})

const variantClass = computed(() => ({
  caption: 'text-2xs leading-none text-muted',
  control: 'text-sm leading-none font-semibold',
  display: 'font-secondary text-3xl leading-none font-semibold',
  meta: 'text-xs leading-none text-muted',
  navigation: 'text-sm leading-none font-medium',
  section: 'font-tertiary text-base leading-none font-semibold text-muted',
})[props.variant])
</script>

<template>
  <component :is="props.as" :class="variantClass">
    <slot />
  </component>
</template>
