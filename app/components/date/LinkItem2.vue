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
      getStyles('item', ['link', 'minh3']), {
        'bg-item-5 text-accent-1': props.isActive,
      },
    ]"
    class="flex items-center px-3 py-0 text-2xs -bg-item-4 rounded-full leading-none font-primary text-nowrap"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
