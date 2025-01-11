<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  isActive?: boolean
}>()
const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="[
      getStyles('item', ['center2', 'padding4', 'minh3']), {
        'bg-item-hover text-accent-1': props.isActive,
      },
    ]"
    class="font-primary text-2xs text-2 text-nowrap rounded-full leading-none"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
