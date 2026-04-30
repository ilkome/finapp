<script setup lang="ts">
export type DateLinkItemProps = {
  isActive?: boolean
  variant?: 'small'
}

const props = defineProps<DateLinkItemProps>()
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="cn(
      'flex items-center text-nowrap rounded-sm text-xs leading-none px-3',
      'interactive flex items-center justify-center min-h-[32px]',
      props.variant === 'small' ? 'px-2 text-2xs text-muted' : 'bg-accented',
      props.isActive ? 'text-primary' : '',
    )"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
