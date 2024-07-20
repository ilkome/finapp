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
      getStyles('item', ['link', 'minh2']),
      {
        'rounded bg-item-5': props.isActive,
      },
    ]"
    class="flex items-center text-nowrap rounded-full bg-item-4 px-3 py-0 font-primary text-xs leading-none"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
