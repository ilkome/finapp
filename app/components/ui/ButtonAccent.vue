<script setup lang="ts">
const props = defineProps<{
  loading?: boolean
  rounded?: boolean
  size?: 'lg' | 'xl'
  variant?: 'outline'
}>()

const emit = defineEmits(['click'])
const colorMode = useColorMode()
</script>

<template>
  <UButton
    v-if="colorMode.preference === 'pink'"
    :loading="props.loading"
    :size="props.size || 'lg'"
    :ui="{ rounded: props.rounded ? 'rounded-full' : 'rounded-lg' }"
    :variant="props.variant"
    block
    class="transition-all duration-150 ease-in-out"
    color="pink"
    @click="emit('click')"
  >
    <slot />
  </UButton>

  <UButton
    v-else
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
