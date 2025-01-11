<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="getStyles('item', ['link', '_bg', 'center', 'minh2', 'minw1', 'rounded'])"
    class="justify-center text-xl group-data-[headlessui-state='open']:!bg-item-3"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
