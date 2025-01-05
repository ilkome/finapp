<script setup lang="ts">
const props = defineProps<{
  loading?: boolean
  rounded?: boolean
  size?: 'lg' | 'xl'
  variant?: 'outline'
}>()

const emit = defineEmits(['click'])
</script>

<template>
  <UButton
    :loading="props.loading"
    :size="props.size || 'lg'"
    :ui="{ rounded: props.rounded ? 'rounded-full' : 'rounded-lg' }"
    :variant="props.variant"
    block
    class="transition-all duration-150 ease-in-out"
    color="blue"
    @click="emit('click')"
  >
    <slot />
  </UButton>
</template>
