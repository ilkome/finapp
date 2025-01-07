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
      getStyles('item', ['link', '_bg', 'padding3', 'center2', 'minh3', 'minw1', 'rounded3']),
      {
        '!bg-item-5': props.isActive,
      },
    ]"
    class="text-nowrap rounded-full font-primary text-xs leading-none"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
