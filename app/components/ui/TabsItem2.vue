<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

defineProps<{
  isActive?: boolean
}>()

const emit = defineEmits(['click'])
</script>

<template>
  <div
    :class="[
      getStyles('item', ['link', 'rounded', 'minh2', '_minw2']),
      { '!bg-item-3 !text-1': isActive },
    ]"
    class="
      border-1 text-2 flex items-center
      justify-center gap-1
      rounded-md
      px-2 text-sm leading-none
    "
    @click="emit('click')"
  >
    <slot />
  </div>
</template>
