<script setup lang="ts">
const props = defineProps<{
  class?: string
  color?: string
  invert?: boolean
  name: string
  size?: number
}>()
</script>

<template>
  <div
    :style="{
      color: props.invert ? '' : props.color,
      backgroundColor: props.invert ? props.color : 'transparent',
    }"
    :class="cn(
      'flex-center aspect-square overflow-hidden text-icon-primary',
      props.invert && cn('rounded-full w-7 p-1.5', props.class),
      props.invert && !props.color && 'bg-muted text-muted!',
    )"
  >
    <Icon
      :name="props.name"
      :size="props.size ?? 20"
    />
  </div>
</template>
