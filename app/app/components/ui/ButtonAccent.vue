<script setup lang="ts">
const props = defineProps<{
  color?: 'neutral' | 'primary'
  loading?: boolean
  size?: 'lg' | 'xl'
  variant?: 'ghost' | 'outline' | 'soft' | 'solid'
}>()

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <UButton
    :color="props.color"
    :loading="props.loading"
    :size="props.size || 'lg'"
    :variant="props.variant"
    block
    @click="emit('click')"
  >
    <slot />
  </UButton>
</template>
