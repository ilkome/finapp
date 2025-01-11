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
      getStyles('item', ['link', '_bg', 'padding2', 'center2', 'minh3', 'minw4', 'rounded3']),
      {
        '_!bg-item-5 text-accent-1': props.isActive,
      },
    ]"
    class="font-primary text-nowrap rounded-full text-xs leading-none"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
