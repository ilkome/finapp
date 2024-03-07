<script setup lang="ts">
import { getStyles } from '~/components/ui/classes'

defineProps<{
  name: string
  isActive?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const slots = defineSlots<{
  icon: any
}>()
</script>

<template>
  <div
    class="flex items-center gap-3 px-3 py-2 text-base"
    :class="[getStyles('item', ['link', 'rounded']), { '!bg-item-3 !text-accent-1': isActive }]"
    @click="emit('click')"
  >
    <div v-if="slots.icon" class="text-xl">
      <slot name="icon" />
    </div>

    <div class="text-xs">
      {{ name }}
    </div>
  </div>
</template>
