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
        'bg-[var(--item-5)] text-primary': props.isActive,
      },
    ]"
    class="text-nowrap rounded-full text-xs leading-none text-(--ui-text)"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
