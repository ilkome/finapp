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
      getStyles('item', ['link', 'bg', 'padding3', 'center2', 'minh2', 'minw1', 'rounded2']),
      {
        '!bg-item-5': props.isActive,
      },
    ]"
    class="font-primary text-nowrap rounded-full text-xs leading-none"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
