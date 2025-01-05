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
        '!text-accent-1 !bg-transparent': props.isActive,
      },
    ]"
    class="text-2xs px-2.5"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
