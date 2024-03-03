<script setup lang="ts">
import { getStyles } from '~/components/ui/classes'

defineProps<{
  isActive: boolean
  icon: string
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <div
    class="flex-center w-10 cursor-pointer rounded-md px-3 py-2 hocus_bg-item-main-hover"
    :class="[
      ...getStyles('item', ['link', 'rounded']),
      { '!text-item-base-up': isActive },
    ]"
    @click="emit('click')"
  >
    <i :class="icon" />
  </div>
</template>
