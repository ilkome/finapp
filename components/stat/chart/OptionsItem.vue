<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

defineProps<{
  icon: string
  isActive: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <div
    class="flex-center w-10 rounded-md px-3 py-2 hocus_bg-item-5"
    :class="[
      ...getStyles('item', ['link', 'rounded', 'minh2', 'center']),
      { '!text-item-1': isActive },
    ]"
    @click="emit('click')"
  >
    <i :class="icon" />
  </div>
</template>
