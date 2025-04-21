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
        'bg-[var(--item-5)] text-(--ui-primary)': props.isActive,
      },
    ]"
    class="text-nowrap rounded-full font-primary text-2xs leading-none text-2"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
