<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="getStyles('item', ['link', 'center', 'minh2', 'minw1', 'rounded'])"
    class="border-item-5 bg-item-4 flex items-center justify-between border px-4 py-2.5"
    @click="(e: Event) => emit('click', e)"
  >
    <div class="text-sm">
      <slot name="label" />
    </div>
    <div class="flex items-center gap-1 text-base">
      <slot name="value" />
      <Icon
        name="lucide:chevron-down"
        class="text-item-2"
      />
    </div>
  </div>
</template>
