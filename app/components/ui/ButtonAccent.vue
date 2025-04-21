<script setup lang="ts">
const props = defineProps<{
  loading?: boolean
  rounded?: boolean
  size?: 'lg' | 'xl'
  variant?: 'outline' | 'ghost'
}>()

const emit = defineEmits(['click'])
</script>

<template>
  <UButton
    :class="{ 'rounded-full': props.rounded, 'rounded-(--ui-radius)': !props.rounded }"
    :loading="props.loading"
    :size="props.size || 'lg'"
    :variant="props.variant"
    block
    @click="emit('click')"
  >
    <slot />
  </UButton>
</template>
