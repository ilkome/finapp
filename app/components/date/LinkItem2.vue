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
        '!text-accent-1 !bg-transparent': props.isActive,
      },
    ]"
    class="text-2xs -bg-item-4 font-primary flex items-center text-nowrap rounded-lg px-3 py-0 leading-none"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
