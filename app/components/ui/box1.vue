<script setup lang="ts">
import { getStyles } from '~/components/ui/getStyles'

const emit = defineEmits<{
  click: [e: Event]
}>()
</script>

<template>
  <div
    :class="getStyles('item', ['link', 'alt', 'center', 'minh4', 'minw1', 'rounded'])"
    class="border-item-5 flex items-center border px-5 py-2.5"
    @click="(e: Event) => emit('click', e)"
  >
    <slot />
  </div>
</template>
