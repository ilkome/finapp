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
      getStyles('item', ['center2', 'padding3', 'minh3']), {
        'bg-item-5 text-accent-1': props.isActive,
      },
    ]"
    class="text-nowrap rounded-full font-primary text-2xs leading-none text-2"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
