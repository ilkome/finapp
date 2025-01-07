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
      getStyles('item', ['link', 'center2', 'minh3', 'rounded3']), {
        '!bg-transparent !text-accent-1': props.isActive,
      },
    ]"
    class="px-2.5 text-2xs"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
